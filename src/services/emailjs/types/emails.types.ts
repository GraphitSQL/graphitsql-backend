type BaseTemplateData = {
  to_email: string;
};

export type SendVerificationEmailData = BaseTemplateData & {
  username: string;
  verification_code: string;
};

export type SendResetPasswordEmailData = BaseTemplateData & {
  username: string;
  reset_code: string;
};
