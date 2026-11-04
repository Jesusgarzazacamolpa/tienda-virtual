package com.agencia.backoffice.report;

import com.agencia.backoffice.common.error.ApiException;
import com.agencia.backoffice.common.error.FlowCode;
import com.agencia.backoffice.user.UserService;
import com.agencia.backoffice.user.dto.UserResponse;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRMapCollectionDataSource;
import net.sf.jasperreports.engine.export.JRPdfExporter;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimpleXlsxReportConfiguration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class ReportService {

    private static final String USERS_CODE = "users";
    private static final String USERS_TEMPLATE = "reports/users.jrxml";

    private static final DateTimeFormatter DISPLAY_TIMESTAMP =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.systemDefault());
    private static final DateTimeFormatter FILE_TIMESTAMP =
            DateTimeFormatter.ofPattern("yyyyMMdd-HHmm").withZone(ZoneId.systemDefault());

    private static final ReportDefinition USERS = new ReportDefinition(
            USERS_CODE,
            "Usuarios",
            "Listado completo de usuarios con roles, estado y fecha de alta.",
            List.of(ReportFormat.PDF.extension(), ReportFormat.XLSX.extension()));

    private final UserService userService;
    private final ConcurrentMap<String, JasperReport> compiledTemplates = new ConcurrentHashMap<>();

    public ReportService(UserService userService) {
        this.userService = userService;
    }

    public List<ReportDefinition> catalog() {
        return List.of(USERS);
    }

    public ReportFile generate(String code, ReportFormat format, String search, String generatedBy) {
        if (!USERS_CODE.equals(code)) {
            throw new ApiException(FlowCode.NOT_FOUND, "El reporte solicitado no existe.");
        }

        List<Map<String, ?>> rows = userRows(search);
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("SEARCH_LABEL", searchLabel(search));
        parameters.put("GENERATED_AT", DISPLAY_TIMESTAMP.format(Instant.now()));
        parameters.put("GENERATED_BY", generatedBy == null || generatedBy.isBlank() ? "Sistema" : generatedBy);
        parameters.put("TOTAL_RECORDS", rows.size());

        JasperPrint print = fill(USERS_TEMPLATE, parameters, rows);
        String filename = "usuarios-" + FILE_TIMESTAMP.format(Instant.now()) + "." + format.extension();
        return new ReportFile(filename, format.contentType(), export(print, format));
    }

    private List<Map<String, ?>> userRows(String search) {
        Pageable unpaged = Pageable.unpaged(Sort.by(Sort.Direction.DESC, "createdAt"));
        return userService.findAll(search, unpaged).content().stream()
                .<Map<String, ?>>map(ReportService::toRow)
                .toList();
    }

    private static Map<String, Object> toRow(UserResponse user) {
        Map<String, Object> row = new HashMap<>();
        row.put("fullName", (user.firstName() + " " + (user.lastName() == null ? "" : user.lastName())).trim());
        row.put("email", user.email());
        row.put("roles", String.join(", ", user.roles()));
        row.put("status", user.enabled() ? "Activo" : "Inactivo");
        row.put("createdAt", user.createdAt() == null ? "" : DISPLAY_TIMESTAMP.format(user.createdAt()));
        return row;
    }

    private JasperPrint fill(String template, Map<String, Object> parameters, List<Map<String, ?>> rows) {
        try {
            JasperReport report = compiledTemplates.computeIfAbsent(template, this::compile);
            return JasperFillManager.fillReport(report, parameters, new JRMapCollectionDataSource(rows));
        } catch (JRException ex) {
            throw new IllegalStateException("No se pudo generar el reporte " + template, ex);
        }
    }

    private JasperReport compile(String template) {
        try (InputStream input = new ClassPathResource(template).getInputStream()) {
            return JasperCompileManager.compileReport(input);
        } catch (IOException | JRException ex) {
            throw new IllegalStateException("No se pudo compilar la plantilla " + template, ex);
        }
    }

    private static byte[] export(JasperPrint print, ReportFormat format) {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try {
            if (format == ReportFormat.PDF) {
                JRPdfExporter exporter = new JRPdfExporter();
                exporter.setExporterInput(new SimpleExporterInput(print));
                exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(output));
                exporter.exportReport();
            } else {
                JRXlsxExporter exporter = new JRXlsxExporter();
                exporter.setExporterInput(new SimpleExporterInput(print));
                exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(output));
                SimpleXlsxReportConfiguration configuration = new SimpleXlsxReportConfiguration();
                configuration.setDetectCellType(true);
                configuration.setRemoveEmptySpaceBetweenColumns(true);
                configuration.setWhitePageBackground(false);
                configuration.setIgnorePageMargins(true);
                exporter.setConfiguration(configuration);
                exporter.exportReport();
            }
        } catch (JRException ex) {
            throw new IllegalStateException("No se pudo exportar el reporte", ex);
        }
        return output.toByteArray();
    }

    private static String searchLabel(String search) {
        if (search == null || search.isBlank()) {
            return "Filtro aplicado: todos los usuarios";
        }
        return "Filtro aplicado: búsqueda \"" + search.trim() + "\"";
    }
}
