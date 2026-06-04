using MailKit.Net.Smtp;
using MimeKit;

public class EmailService
{
    private readonly IConfiguration _config;
    public EmailService(IConfiguration config) => _config = config;

    public async Task SendSessionConfirmationAsync(string toEmail, string studentName, string topic, DateTime startTime)
    {
        var email = new MimeMessage();
        email.From.Add(new MailboxAddress("SkillSync Team", _config["EmailSettings:Email"]));
        email.To.Add(MailboxAddress.Parse(toEmail));
        email.Subject = "Session Registration Confirmed ✅";
        email.Body = new TextPart("html")
        {
            Text = $"""
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                      <meta charset="UTF-8" />
                      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                      <title>Session Confirmed</title>
                    </head>
                    <body style="margin:0;padding:0;background:#f0f2ff;font-family:'Segoe UI',Arial,sans-serif;">

                      <!-- Wrapper -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2ff;padding:40px 0;">
                        <tr>
                          <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

                              <!-- Header -->
                              <tr>
                                <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:20px 20px 0 0;padding:40px 40px 30px;text-align:center;">
                                  <div style="font-size:42px;margin-bottom:12px;">🎓</div>
                                  <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">SkillSync</h1>
                                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;letter-spacing:1px;text-transform:uppercase;">Learning Platform</p>
                                </td>
                              </tr>

                              <!-- Body -->
                              <tr>
                                <td style="background:#ffffff;padding:40px;">

                                  <!-- Greeting -->
                                  <h2 style="margin:0 0 8px;color:#2d3748;font-size:24px;font-weight:700;">
                                    Hey, {studentName}! 👋
                                  </h2>
                                  <p style="margin:0 0 28px;color:#718096;font-size:15px;line-height:1.6;">
                                    Great news — you've successfully registered for a session. 
                                    Here are the details:
                                  </p>

                                  <!-- Session Card -->
                                  <div style="background:linear-gradient(135deg,rgba(102,126,234,0.06),rgba(118,75,162,0.06));border:1px solid rgba(102,126,234,0.2);border-radius:16px;padding:28px;margin-bottom:28px;">

                                    <!-- Topic -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                                      <tr>
                                        <td style="width:44px;vertical-align:top;">
                                          <div style="width:40px;height:40px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;text-align:center;line-height:40px;font-size:18px;">📚</div>
                                        </td>
                                        <td style="padding-left:14px;vertical-align:top;">
                                          <p style="margin:0 0 2px;color:#a0aec0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Topic</p>
                                          <p style="margin:0;color:#2d3748;font-size:16px;font-weight:700;">{topic}</p>
                                        </td>
                                      </tr>
                                    </table>

                                    <!-- Divider -->
                                    <div style="height:1px;background:rgba(102,126,234,0.15);margin-bottom:20px;"></div>

                                    <!-- Date -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                      <tr>
                                        <td style="width:44px;vertical-align:top;">
                                          <div style="width:40px;height:40px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;text-align:center;line-height:40px;font-size:18px;">📅</div>
                                        </td>
                                        <td style="padding-left:14px;vertical-align:top;">
                                          <p style="margin:0 0 2px;color:#a0aec0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Date & Time</p>
                                          <p style="margin:0;color:#2d3748;font-size:16px;font-weight:700;">{startTime:dd MMM yyyy} &nbsp;·&nbsp; {startTime:HH:mm}</p>
                                        </td>
                                      </tr>
                                    </table>
                                  </div>

                                  <!-- CTA Button -->
                                  <div style="text-align:center;margin-bottom:28px;">
                                    <a href="https://localhost:3000" 
                                       style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:30px;letter-spacing:0.3px;box-shadow:0 8px 24px rgba(102,126,234,0.35);">
                                      View My Sessions →
                                    </a>
                                  </div>

                                  <!-- Tips -->
                                  <div style="background:#f7f8ff;border-radius:12px;padding:20px 24px;margin-bottom:8px;">
                                    <p style="margin:0 0 10px;color:#553c9a;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">💡 Tips for a great session</p>
                                    <ul style="margin:0;padding-left:18px;color:#718096;font-size:13px;line-height:1.8;">
                                      <li>Join a few minutes early to test your connection</li>
                                      <li>Prepare your questions in advance</li>
                                      <li>Find a quiet place with good lighting</li>
                                    </ul>
                                  </div>

                                </td>
                              </tr>

                              <!-- Footer -->
                              <tr>
                                <td style="background:#f7f8ff;border-radius:0 0 20px 20px;padding:24px 40px;text-align:center;border-top:1px solid #edf0f7;">
                                  <p style="margin:0 0 6px;color:#a0aec0;font-size:12px;">
                                    You received this email because you registered on <strong>SkillSync</strong>.
                                  </p>
                                  <p style="margin:0;color:#cbd5e0;font-size:11px;">
                                    © {DateTime.UtcNow.Year} SkillSync. All rights reserved.
                                  </p>
                                </td>
                              </tr>

                            </table>
                          </td>
                        </tr>
                      </table>

                    </body>
                    </html>
                    """
        };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(_config["EmailSettings:Host"],
            int.Parse(_config["EmailSettings:Port"]), false);
        await smtp.AuthenticateAsync(_config["EmailSettings:Email"],
            _config["EmailSettings:Password"]);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}