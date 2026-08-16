from urllib.parse import quote

import resend

from app.core.config import settings


class EmailService:

    # ==========================================================
    # CORE EMAIL SENDER
    # ==========================================================

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

    # ==========================================================
    # BRAND ASSETS
    # ==========================================================

    @staticmethod
    def _asset_url(
        filename: str,
    ) -> str:

        return (
            f"{settings.frontend_base_url}"
            f"/assets/brand/{filename}"
        )

    # ==========================================================
    # OTP BLOCK
    # ==========================================================

    @staticmethod
    def _otp_block(
        otp: str,
        helper_text: str,
    ) -> str:

        spaced_otp = " ".join(otp)

        return f"""
        <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
                margin: 0 auto;
            "
        >

            <tr>

                <td
                    align="center"
                    style="
                        padding:
                            30px 0 8px;
                    "
                >

                    <!-- OTP LABEL -->

                    <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >

                        <tr>

                            <td
                                align="center"
                                style="
                                    font-family:
                                        Arial,
                                        Helvetica,
                                        sans-serif;

                                    font-size: 10px;

                                    font-weight: 700;

                                    letter-spacing: 3px;

                                    color: #a78bfa;

                                    text-transform:
                                        uppercase;

                                    padding-bottom: 14px;
                                "
                            >
                                VERIFICATION CODE
                            </td>

                        </tr>

                    </table>


                    <!-- OTP BOX -->

                    <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                            margin: 0 auto;
                        "
                    >

                        <tr>

                            <td
                                align="center"
                                style="
                                    width: 280px;

                                    padding:
                                        21px 28px;

                                    border-radius:
                                        16px;

                                    border:
                                        1px solid
                                        #6841c7;

                                    background-color:
                                        #09070f;

                                    box-shadow:
                                        0 0 26px
                                        rgba(
                                            124,
                                            58,
                                            237,
                                            0.12
                                        );
                                "
                            >

                                <span
                                    style="
                                        font-family:
                                            'Courier New',
                                            Courier,
                                            monospace;

                                        font-size: 28px;

                                        line-height: 1;

                                        font-weight: 700;

                                        letter-spacing: 8px;

                                        color: #d8ccff;

                                        white-space:
                                            nowrap;
                                    "
                                >
                                    {spaced_otp}
                                </span>

                            </td>

                        </tr>

                    </table>


                    <!-- OTP HELPER -->

                    <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >

                        <tr>

                            <td
                                align="center"
                                style="
                                    padding-top: 14px;

                                    font-family:
                                        Arial,
                                        Helvetica,
                                        sans-serif;

                                    font-size: 12px;

                                    line-height: 1.6;

                                    color: #71717a;
                                "
                            >
                                {helper_text}
                            </td>

                        </tr>

                    </table>

                </td>

            </tr>

        </table>
        """

    # ==========================================================
    # CTA BUTTON
    # ==========================================================

    @staticmethod
    def _button(
        text: str,
        url: str,
    ) -> str:

        return f"""
        <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
        >

            <tr>

                <td
                    align="center"
                    style="
                        padding:
                            30px 0 34px;
                    "
                >

                    <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                    >

                        <tr>

                            <td
                                align="center"
                                bgcolor="#ffffff"
                                style="
                                    border-radius: 12px;
                                "
                            >

                                <a
                                    href="{url}"
                                    style="
                                        display:
                                            inline-block;

                                        padding:
                                            15px 28px;

                                        border-radius:
                                            12px;

                                        background-color:
                                            #ffffff;

                                        color: #09090b;

                                        font-family:
                                            Arial,
                                            Helvetica,
                                            sans-serif;

                                        font-size: 14px;

                                        font-weight: 700;

                                        line-height: 1;

                                        text-decoration:
                                            none;

                                        white-space:
                                            nowrap;
                                    "
                                >
                                    {text}

                                    <span
                                        style="
                                            padding-left:
                                                9px;

                                            font-size: 16px;
                                        "
                                    >
                                        →
                                    </span>

                                </a>

                            </td>

                        </tr>

                    </table>

                </td>

            </tr>

        </table>
        """

    # ==========================================================
    # BASE EMAIL TEMPLATE
    # ==========================================================

    @staticmethod
    def _base_template(
        content: str,
    ) -> str:

        logo_url = EmailService._asset_url(
            "dasaiko-horizontal-white.png"
        )

        mark_url = EmailService._asset_url(
            "dasaiko-mark-white.png"
        )

        return f"""
        <!DOCTYPE html>

        <html lang="en">

        <head>

            <meta charset="UTF-8" />

            <meta
                name="viewport"
                content="
                    width=device-width,
                    initial-scale=1.0
                "
            />

            <meta
                name="color-scheme"
                content="dark"
            />

            <meta
                name="supported-color-schemes"
                content="dark"
            />

            <title>Dasaiko</title>

        </head>


        <body
            style="
                margin: 0;
                padding: 0;

                background-color:
                    #030208;

                color: #ffffff;

                font-family:
                    Arial,
                    Helvetica,
                    sans-serif;
            "
        >

            <!-- =================================================
                 EMAIL BACKGROUND
            ================================================== -->

            <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                    width: 100%;

                    background-color:
                        #030208;
                "
            >

                <tr>

                    <td
                        align="center"
                        style="
                            padding:
                                48px 16px;
                        "
                    >


                        <!-- =================================================
                             BRAND HEADER
                        ================================================== -->

                        <table
                            role="presentation"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            width="100%"
                            style="
                                max-width: 560px;
                            "
                        >

                            <tr>

                                <td
                                    align="center"
                                    style="
                                        padding:
                                            0 0 30px;
                                    "
                                >

                                    <img
                                        src="{logo_url}"
                                        alt="
                                            Dasaiko -
                                            Research,
                                            Backed.
                                        "
                                        width="250"
                                        style="
                                            display: block;

                                            width: 250px;

                                            max-width: 80%;

                                            height: auto;

                                            border: 0;

                                            outline: none;

                                            text-decoration:
                                                none;
                                        "
                                    />

                                </td>

                            </tr>

                        </table>


                        <!-- =================================================
                             MAIN CARD
                        ================================================== -->

                        <table
                            role="presentation"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            width="100%"
                            style="
                                max-width: 560px;

                                background-color:
                                    #0c0a12;

                                border:
                                    1px solid
                                    #272235;

                                border-radius:
                                    24px;

                                box-shadow:
                                    0 24px 70px
                                    rgba(
                                        0,
                                        0,
                                        0,
                                        0.55
                                    );
                            "
                        >

                            <tr>

                                <td
                                    align="center"
                                    style="
                                        padding:
                                            46px 36px
                                            44px;
                                    "
                                >

                                    {content}

                                </td>

                            </tr>

                        </table>


                        <!-- =================================================
                             FOOTER
                        ================================================== -->

                        <table
                            role="presentation"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            width="100%"
                            style="
                                max-width: 560px;
                            "
                        >

                            <tr>

                                <td
                                    align="center"
                                    style="
                                        padding:
                                            34px 16px 0;
                                    "
                                >

                                    <img
                                        src="{mark_url}"
                                        alt="Dasaiko"
                                        width="32"
                                        style="
                                            display:
                                                block;

                                            width: 32px;

                                            height:
                                                auto;

                                            margin:
                                                0 auto 13px;

                                            border: 0;
                                        "
                                    />


                                    <div
                                        style="
                                            font-family:
                                                Arial,
                                                Helvetica,
                                                sans-serif;

                                            font-size: 10px;

                                            font-weight: 700;

                                            letter-spacing: 4px;

                                            color: #71717a;
                                        "
                                    >
                                        DASAIKO
                                    </div>


                                    <div
                                        style="
                                            margin-top: 7px;

                                            font-family:
                                                Arial,
                                                Helvetica,
                                                sans-serif;

                                            font-size: 9px;

                                            font-weight: 600;

                                            letter-spacing: 3px;

                                            color: #6d4ac2;
                                        "
                                    >
                                        RESEARCH, BACKED.
                                    </div>

                                </td>

                            </tr>

                        </table>


                    </td>

                </tr>

            </table>

        </body>

        </html>
        """

    # ==========================================================
    # VERIFICATION EMAIL
    # ==========================================================

    @staticmethod
    def send_verification_otp(
        recipient: str,
        otp: str,
    ) -> None:

        verification_url = (
            f"{settings.frontend_base_url}"
            f"/verify-email"
            f"?email={quote(recipient)}"
        )

        content = f"""

        <!-- EYEBROW -->

        <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
        >

            <tr>

                <td
                    align="center"
                    style="
                        padding-bottom: 13px;

                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;

                        font-size: 10px;

                        font-weight: 700;

                        letter-spacing: 3px;

                        color: #a78bfa;
                    "
                >
                    EMAIL VERIFICATION
                </td>

            </tr>

        </table>


        <!-- TITLE -->

        <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
        >

            <tr>

                <td
                    align="center"
                    style="
                        padding-bottom: 16px;

                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;

                        font-size: 30px;

                        line-height: 1.2;

                        font-weight: 700;

                        letter-spacing: -1px;

                        color: #ffffff;
                    "
                >
                    Welcome to Dasaiko.
                </td>

            </tr>

        </table>


        <!-- DESCRIPTION -->

        <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
        >

            <tr>

                <td
                    align="center"
                    style="
                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;

                        font-size: 14px;

                        line-height: 1.75;

                        color: #a1a1aa;

                        padding:
                            0 8px;
                    "
                >
                    Your account is almost ready.
                    Verify your email address to
                    finish setting up your Dasaiko
                    research workspace.
                </td>

            </tr>

        </table>


        <!-- OTP -->

        {EmailService._otp_block(
            otp=otp,
            helper_text=(
                "Enter this code in Dasaiko "
                "to verify your email address."
            ),
        )}


        <!-- CTA -->

        {EmailService._button(
            text="Verify email",
            url=verification_url,
        )}


        <!-- DIVIDER -->

        <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
        >

            <tr>

                <td
                    style="
                        border-top:
                            1px solid
                            #24212d;

                        height: 1px;

                        line-height: 1px;

                        font-size: 1px;
                    "
                >
                    &nbsp;
                </td>

            </tr>

        </table>


        <!-- EXPIRY -->

        <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
        >

            <tr>

                <td
                    align="center"
                    style="
                        padding-top: 24px;

                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;

                        font-size: 12px;

                        line-height: 1.7;

                        color: #71717a;
                    "
                >
                    This verification code expires
                    in

                    <strong
                        style="
                            color: #c4b5fd;
                        "
                    >
                        10 minutes
                    </strong>.
                </td>

            </tr>

            <tr>

                <td
                    align="center"
                    style="
                        padding-top: 8px;

                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;

                        font-size: 12px;

                        line-height: 1.7;

                        color: #52525b;
                    "
                >
                    If you didn't create a Dasaiko
                    account, you can safely ignore
                    this email.
                </td>

            </tr>

        </table>

        """

        html = EmailService._base_template(
            content
        )

        EmailService.send_email(
            recipient=recipient,
            subject="Welcome to Dasaiko — verify your email",
            html=html,
        )

    # ==========================================================
    # PASSWORD RESET EMAIL
    # ==========================================================

    @staticmethod
    def send_password_reset_otp(
        recipient: str,
        otp: str,
    ) -> None:

        reset_url = (
            f"{settings.frontend_base_url}"
            f"/reset-password"
            f"?email={quote(recipient)}"
        )

        content = f"""

        <!-- EYEBROW -->

        <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
        >

            <tr>

                <td
                    align="center"
                    style="
                        padding-bottom: 13px;

                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;

                        font-size: 10px;

                        font-weight: 700;

                        letter-spacing: 3px;

                        color: #a78bfa;
                    "
                >
                    PASSWORD RESET
                </td>

            </tr>

        </table>


        <!-- TITLE -->

        <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
        >

            <tr>

                <td
                    align="center"
                    style="
                        padding-bottom: 16px;

                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;

                        font-size: 30px;

                        line-height: 1.2;

                        font-weight: 700;

                        letter-spacing: -1px;

                        color: #ffffff;
                    "
                >
                    Reset your password.
                </td>

            </tr>

        </table>


        <!-- DESCRIPTION -->

        <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
        >

            <tr>

                <td
                    align="center"
                    style="
                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;

                        font-size: 14px;

                        line-height: 1.75;

                        color: #a1a1aa;

                        padding:
                            0 8px;
                    "
                >
                    We received a request to reset
                    your Dasaiko account password.
                    Use the verification code below
                    to continue.
                </td>

            </tr>

        </table>


        <!-- OTP -->

        {EmailService._otp_block(
            otp=otp,
            helper_text=(
                "Enter this code in Dasaiko "
                "to continue."
            ),
        )}


        <!-- CTA -->

        {EmailService._button(
            text="Reset password",
            url=reset_url,
        )}


        <!-- DIVIDER -->

        <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
        >

            <tr>

                <td
                    style="
                        border-top:
                            1px solid
                            #24212d;

                        height: 1px;

                        line-height: 1px;

                        font-size: 1px;
                    "
                >
                    &nbsp;
                </td>

            </tr>

        </table>


        <!-- EXPIRY -->

        <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
        >

            <tr>

                <td
                    align="center"
                    style="
                        padding-top: 24px;

                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;

                        font-size: 12px;

                        line-height: 1.7;

                        color: #71717a;
                    "
                >
                    This reset code expires in

                    <strong
                        style="
                            color: #c4b5fd;
                        "
                    >
                        10 minutes
                    </strong>.
                </td>

            </tr>

            <tr>

                <td
                    align="center"
                    style="
                        padding-top: 8px;

                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;

                        font-size: 12px;

                        line-height: 1.7;

                        color: #52525b;
                    "
                >
                    If you did not request a password
                    reset, you can safely ignore
                    this email.
                </td>

            </tr>

        </table>

        """

        html = EmailService._base_template(
            content
        )

        EmailService.send_email(
            recipient=recipient,
            subject="Reset your Dasaiko password",
            html=html,
        )