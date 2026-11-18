using System.Net;

namespace Nexora.Api.Helpers;

public static class EmailTemplateBuilder
{
    public static string BuildConfirmEmail(string? name, string confirmationLink, string siteUrl = "https://agora.dev.br")
    {
        var safeName = string.IsNullOrWhiteSpace(name) ? "estudante" : WebUtility.HtmlEncode(name.Trim());
        var safeLink = WebUtility.HtmlEncode(confirmationLink);

        return BuildLayout(
            title: "Confirme seu e-mail — Ágora",
            preheader: "Confirme seu endereço de e-mail para ativar sua conta na plataforma Ágora.",
            badgeText: "CONFIRMAÇÃO DE CONTA",
            badgeBg: "#ecfdf5",
            badgeColor: "#047857",
            headline: "Bem-vindo ao Ágora",
            bodyHtml: $@"
                <p style='margin:0 0 16px;color:#334155;font-size:15px;line-height:1.65;'>
                    Olá, <strong style='color:#0f172a;'>{safeName}</strong>.
                </p>
                <p style='margin:0 0 28px;color:#475569;font-size:15px;line-height:1.65;'>
                    Sua conta na plataforma acadêmica <strong style='color:#0f172a;'>Ágora</strong> foi criada. Para começar a publicar projetos, acompanhar avaliações e construir seu portfólio, confirme seu endereço de e-mail abaixo.
                </p>",
            ctaLabel: "Confirmar meu e-mail",
            ctaUrl: safeLink,
            noticeAccentColor: "#16a34a",
            noticeTitle: "Validade do link",
            noticeText: "Por segurança, este link de confirmação expira em 24 horas.",
            footerNote: "Se você não criou uma conta no Ágora, pode ignorar este e-mail com segurança.",
            siteUrl: siteUrl
        );
    }

    public static string BuildResetPasswordEmail(string? name, string resetLink, string siteUrl = "https://agora.dev.br")
    {
        var safeName = string.IsNullOrWhiteSpace(name) ? "usuário" : WebUtility.HtmlEncode(name.Trim());
        var safeLink = WebUtility.HtmlEncode(resetLink);

        return BuildLayout(
            title: "Redefina sua senha — Ágora",
            preheader: "Recebemos uma solicitação para redefinir a senha da sua conta no Ágora.",
            badgeText: "SEGURANÇA DA CONTA",
            badgeBg: "#fffbeb",
            badgeColor: "#b45309",
            headline: "Redefina sua senha",
            bodyHtml: $@"
                <p style='margin:0 0 16px;color:#334155;font-size:15px;line-height:1.65;'>
                    Olá, <strong style='color:#0f172a;'>{safeName}</strong>.
                </p>
                <p style='margin:0 0 28px;color:#475569;font-size:15px;line-height:1.65;'>
                    Recebemos uma solicitação para alterar a senha da sua conta no <strong style='color:#0f172a;'>Ágora</strong>. Clique no botão abaixo para escolher uma nova senha.
                </p>",
            ctaLabel: "Criar nova senha",
            ctaUrl: safeLink,
            noticeAccentColor: "#d97706",
            noticeTitle: "Link temporário",
            noticeText: "Este link expira em 1 hora. Caso o prazo termine, você poderá solicitar uma nova redefinição na página de login.",
            footerNote: "Se você não solicitou a redefinição de senha, nenhuma alteração será feita e você pode ignorar esta mensagem.",
            siteUrl: siteUrl
        );
    }

    private static string BuildLayout(
        string title,
        string preheader,
        string badgeText,
        string badgeBg,
        string badgeColor,
        string headline,
        string bodyHtml,
        string ctaLabel,
        string ctaUrl,
        string noticeAccentColor,
        string noticeTitle,
        string noticeText,
        string footerNote,
        string siteUrl)
    {
        var cleanSiteUrl = WebUtility.HtmlEncode(siteUrl.TrimEnd('/'));
        var displayHost = siteUrl
            .Replace("https://", "", StringComparison.OrdinalIgnoreCase)
            .Replace("http://", "", StringComparison.OrdinalIgnoreCase)
            .TrimEnd('/');
        if (string.IsNullOrWhiteSpace(displayHost) || displayHost.StartsWith("localhost", StringComparison.OrdinalIgnoreCase))
        {
            displayHost = "agora.dev.br";
        }
        var safeHost = WebUtility.HtmlEncode(displayHost);

        return $@"<!DOCTYPE html>
<html lang='pt-BR' xmlns='http://www.w3.org/1999/xhtml'>
<head>
    <meta charset='UTF-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1.0' />
    <meta http-equiv='X-UA-Compatible' content='IE=edge' />
    <meta name='color-scheme' content='light' />
    <meta name='supported-color-schemes' content='light' />
    <title>{title}</title>
</head>
<body style='margin:0;padding:0;background-color:#f3f6f4;font-family:-apple-system,BlinkMacSystemFont,""Segoe UI"",Roboto,""Helvetica Neue"",Arial,sans-serif;-webkit-font-smoothing:antialiased;'>
    <!-- Preheader invisível para preview na caixa de entrada -->
    <div style='display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f3f6f4;opacity:0;'>
        {preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>

    <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='background-color:#f3f6f4;'>
        <tr>
            <td align='center' style='padding:40px 16px;'>
                <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8e4;box-shadow:0 8px 24px rgba(15,23,42,0.06);'>
                    <!-- Faixa superior esmeralda -->
                    <tr>
                        <td style='height:4px;background-color:#22c55e;font-size:0;line-height:0;'>&nbsp;</td>
                    </tr>

                    <!-- Header escuro com a nova logo do Ágora -->
                    <tr>
                        <td align='center' style='background-color:#141c18;padding:32px 32px 28px;'>
                            <table role='presentation' cellspacing='0' cellpadding='0' border='0' align='center'>
                                <tr>
                                    <td valign='bottom' style='padding-right:2px;'>
                                        <img src='cid:agora-logo' alt='Á' width='32' height='34' style='display:block;border:0;outline:none;text-decoration:none;' />
                                    </td>
                                    <td valign='bottom' style='padding-bottom:1px;'>
                                        <span style='font-family:""Space Grotesk"",-apple-system,BlinkMacSystemFont,""Segoe UI"",Roboto,Helvetica,Arial,sans-serif;font-size:29px;font-weight:700;color:#ffffff;letter-spacing:-0.03em;line-height:1;'>gora</span>
                                    </td>
                                </tr>
                            </table>
                            <p style='margin:10px 0 0;color:#86efac;font-size:10px;font-weight:600;letter-spacing:2.2px;text-transform:uppercase;'>
                                Plataforma Acadêmica de Projetos
                            </p>
                        </td>
                    </tr>

                    <!-- Corpo principal -->
                    <tr>
                        <td style='padding:36px 36px 28px;'>
                            <!-- Selo de categoria -->
                            <table role='presentation' cellspacing='0' cellpadding='0' border='0' style='margin:0 0 18px;'>
                                <tr>
                                    <td style='background-color:{badgeBg};color:{badgeColor};font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:5px 11px;border-radius:999px;'>
                                        {badgeText}
                                    </td>
                                </tr>
                            </table>

                            <h1 style='margin:0 0 18px;font-family:""Space Grotesk"",-apple-system,BlinkMacSystemFont,""Segoe UI"",Roboto,Helvetica,Arial,sans-serif;font-size:24px;font-weight:700;color:#0f172a;letter-spacing:-0.02em;line-height:1.25;'>
                                {headline}
                            </h1>

                            {bodyHtml}

                            <!-- Botão CTA -->
                            <table role='presentation' cellspacing='0' cellpadding='0' border='0' style='margin:0 0 28px;'>
                                <tr>
                                    <td align='center' style='border-radius:10px;background-color:#16a34a;'>
                                        <a href='{ctaUrl}' target='_blank' style='display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:-0.01em;'>
                                            {ctaLabel} &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Aviso de validade -->
                            <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='margin:0 0 28px;background-color:#f8faf9;border:1px solid #e5ebe7;border-left:3px solid {noticeAccentColor};border-radius:8px;'>
                                <tr>
                                    <td style='padding:14px 16px;'>
                                        <p style='margin:0 0 4px;font-size:12px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;'>
                                            {noticeTitle}
                                        </p>
                                        <p style='margin:0;font-size:13px;color:#475569;line-height:1.55;'>
                                            {noticeText}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Separador -->
                            <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='margin:0 0 20px;'>
                                <tr>
                                    <td style='height:1px;background-color:#edf2ef;font-size:0;line-height:0;'>&nbsp;</td>
                                </tr>
                            </table>

                            <!-- Link alternativo -->
                            <p style='margin:0 0 8px;font-size:12px;color:#64748b;line-height:1.5;'>
                                Se o botão não funcionar, copie e cole o endereço abaixo no seu navegador:
                            </p>
                            <p style='margin:0;padding:12px 14px;background-color:#f8faf9;border:1px solid #e5ebe7;border-radius:8px;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;line-height:1.5;color:#15803d;'>
                                <a href='{ctaUrl}' target='_blank' style='color:#15803d;text-decoration:none;'>{ctaUrl}</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Rodapé -->
                    <tr>
                        <td style='padding:22px 36px 26px;background-color:#f8faf9;border-top:1px solid #e8edea;'>
                            <p style='margin:0 0 10px;font-size:12px;color:#64748b;line-height:1.55;'>
                                {footerNote}
                            </p>
                            <p style='margin:0;font-size:12px;color:#94a3b8;line-height:1.5;'>
                                &copy; 2026 <strong style='color:#475569;'>Ágora</strong> &middot; Plataforma Acadêmica &middot;
                                <a href='{cleanSiteUrl}' target='_blank' style='color:#16a34a;text-decoration:none;font-weight:600;'>{safeHost}</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }
}
