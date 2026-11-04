package com.agencia.backoffice.common.logging;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.encoder.PatternLayoutEncoder;
import ch.qos.logback.classic.joran.JoranConfigurator;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.util.LogbackMDCAdapter;
import ch.qos.logback.core.ConsoleAppender;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.Test;

import java.net.URL;

import static org.assertj.core.api.Assertions.assertThat;

class LogMaskingTest {

    @Test
    void masksSecretsEmailsAndCards() throws Exception {
        LoggerContext context = new LoggerContext();
        context.setMDCAdapter(new LogbackMDCAdapter());
        JoranConfigurator configurator = new JoranConfigurator();
        configurator.setContext(context);
        URL config = getClass().getClassLoader().getResource("logback-spring.xml");
        configurator.doConfigure(config);
        context.start();

        Logger root = context.getLogger(Logger.ROOT_LOGGER_NAME);
        @SuppressWarnings("unchecked")
        ConsoleAppender<ILoggingEvent> appender =
                (ConsoleAppender<ILoggingEvent>) root.getAppender("CONSOLE");
        PatternLayoutEncoder encoder = (PatternLayoutEncoder) appender.getEncoder();
        if (!encoder.isStarted()) {
            encoder.start();
        }

        root.detachAppender("CONSOLE");

        ListAppender<ILoggingEvent> listAppender = new ListAppender<>();
        listAppender.setContext(context);
        listAppender.start();
        root.addAppender(listAppender);

        context.getLogger("masking-test")
                .info("login password=SuperSecret123 email=juan.perez@mail.com card=4111111111111111");

        ILoggingEvent event = listAppender.list.getFirst();
        String output = encoder.getLayout().doLayout(event);

        assertThat(output)
                .doesNotContain("SuperSecret123")
                .contains("password=***")
                .contains("j***@mail.com")
                .doesNotContain("4111111111111111")
                .contains("4111************1111");
    }
}
