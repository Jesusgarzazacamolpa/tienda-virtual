package com.agencia.backoffice.report;

import com.agencia.backoffice.common.error.ApiException;
import com.agencia.backoffice.common.error.FlowCode;
import com.agencia.backoffice.common.web.PageResponse;
import com.agencia.backoffice.user.UserService;
import com.agencia.backoffice.user.dto.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ReportServiceTest {

    private UserService userService;
    private ReportService reportService;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        reportService = new ReportService(userService);
    }

    @Test
    void generatesPdfForUsers() {
        when(userService.findAll(eq("ana"), any())).thenReturn(pageWith(sampleUser()));

        ReportFile file = reportService.generate("users", ReportFormat.PDF, "ana", "admin@test.com");

        assertThat(file.filename()).matches("usuarios-\\d{8}-\\d{4}\\.pdf");
        assertThat(file.contentType()).isEqualTo("application/pdf");
        assertThat(new String(file.content(), 0, 5, StandardCharsets.US_ASCII)).isEqualTo("%PDF-");
    }

    @Test
    void generatesXlsxForUsers() {
        when(userService.findAll(isNull(), any())).thenReturn(pageWith(sampleUser()));

        ReportFile file = reportService.generate("users", ReportFormat.XLSX, null, "admin@test.com");

        assertThat(file.filename()).matches("usuarios-\\d{8}-\\d{4}\\.xlsx");
        assertThat(file.contentType())
                .isEqualTo("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        assertThat(file.content()).startsWith((byte) 'P', (byte) 'K');
    }

    @Test
    void generatesReportWithoutRows() {
        when(userService.findAll(isNull(), any()))
                .thenReturn(new PageResponse<>(List.of(), 0, 0, 0, 0));

        ReportFile file = reportService.generate("users", ReportFormat.PDF, null, null);

        assertThat(file.content().length).isGreaterThan(0);
        assertThat(new String(file.content(), 0, 5, StandardCharsets.US_ASCII)).isEqualTo("%PDF-");
    }

    @Test
    void listsUsersReportInCatalog() {
        assertThat(reportService.catalog())
                .singleElement()
                .satisfies(report -> {
                    assertThat(report.code()).isEqualTo("users");
                    assertThat(report.formats()).containsExactly("pdf", "xlsx");
                });
    }

    @Test
    void rejectsUnknownReportCode() {
        assertThatThrownBy(() -> reportService.generate("invoices", ReportFormat.PDF, null, null))
                .isInstanceOfSatisfying(ApiException.class,
                        ex -> assertThat(ex.flowCode()).isEqualTo(FlowCode.NOT_FOUND));
    }

    @Test
    void rejectsUnknownFormat() {
        assertThatThrownBy(() -> ReportFormat.from("docx"))
                .isInstanceOfSatisfying(ApiException.class,
                        ex -> assertThat(ex.flowCode()).isEqualTo(FlowCode.INVALID_REQUEST));
    }

    @Test
    void defaultsToPdfWhenFormatIsMissing() {
        assertThat(ReportFormat.from(null)).isEqualTo(ReportFormat.PDF);
        assertThat(ReportFormat.from("  ")).isEqualTo(ReportFormat.PDF);
        assertThat(ReportFormat.from("XLSX")).isEqualTo(ReportFormat.XLSX);
    }

    private static PageResponse<UserResponse> pageWith(UserResponse... users) {
        return new PageResponse<>(List.of(users), 0, users.length, users.length, 1);
    }

    private static UserResponse sampleUser() {
        Instant now = Instant.parse("2026-01-01T10:00:00Z");
        return new UserResponse(UUID.randomUUID(), "ana@empresa.com", "Ana", "López", true,
                List.of("ADMIN", "USER"), now, now);
    }
}
