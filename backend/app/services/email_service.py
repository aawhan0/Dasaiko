import resend

from app.core.config import settings


class EmailService:

    @staticmethod
    def send_email(
        recipient: str,
        subject: str,
        html: str,
    ) -> None:
        resend.api_key = settings.resend_api_key

        params: resend.Emails.SendParams = {
            "from": settings.resend_from_email,
            "to": [recipient],
            "subject": subject,
            "html": html,
        }

        print(
            "[EMAIL] Sending email:",
            {
                "from": settings.resend_from_email,
                "to": recipient,
                "subject": subject,
            },
        )

        try:
            response = resend.Emails.send(
                params
            )

            print(
                "[EMAIL] Resend response:",
                response,
            )

        except Exception as error:
            print(
                "[EMAIL] Resend delivery failed:",
                {
                    "type": type(error).__name__,
                    "message": str(error),
                },
            )

            raise

    @staticmethod
    def send_verification_otp(
        recipient: str,
        otp: str,
    ) -> None:
        html = f"""
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8" />

            <meta
                name="viewport"
                content="width=device-width,
                         initial-scale=1.0"
            />

            <title>
                Verify your Dasaiko account
            </title>
        </head>

        <body
            style="
                margin: 0;
                padding: 0;
                background: #050505;
                color: #ffffff;
                font-family:
                    Arial,
                    Helvetica,
                    sans-serif;
            "
        >

            <div
                style="
                    max-width: 520px;
                    margin: 0 auto;
                    padding: 48px 24px;
                "
            >

                <div
                    style="
                        border: 1px solid
                            rgba(255,255,255,0.08);
                        border-radius: 16px;
                        background: #0b0b0f;
                        padding: 36px;
                    "
                >

                    <h1
                        style="
                            margin: 0 0 12px;
                            font-size: 24px;
                            color: #ffffff;
                        "
                    >
                        Verify your Dasaiko account
                    </h1>

                    <p
                        style="
                            margin: 0 0 28px;
                            color: #a1a1aa;
                            line-height: 1.6;
                        "
                    >
                        Use the verification code below
                        to confirm that this email address
                        belongs to you.
                    </p>

                    <div
                        style="
                            margin: 0 0 28px;
                            padding: 20px;
                            border-radius: 12px;
                            background: #15111f;
                            border: 1px solid
                                rgba(139,92,246,0.25);
                            text-align: center;
                        "
                    >

                        <div
                            style="
                                font-size: 32px;
                                font-weight: 700;
                                letter-spacing: 8px;
                                color: #c4b5fd;
                            "
                        >
                            {otp}
                        </div>

                    </div>

                    <p
                        style="
                            margin: 0;
                            color: #71717a;
                            font-size: 13px;
                            line-height: 1.6;
                        "
                    >
                        This code expires in 10 minutes.
                        If you did not create a Dasaiko
                        account, you can safely ignore
                        this email.
                    </p>

                </div>

                <p
                    style="
                        margin-top: 24px;
                        text-align: center;
                        color: #52525b;
                        font-size: 12px;
                    "
                >
                    Dasaiko - The AI That Shows Its Work
                </p>

            </div>

        </body>
        </html>
        """

        EmailService.send_email(
            recipient=recipient,
            subject="Verify your Dasaiko account",
            html=html,
        )