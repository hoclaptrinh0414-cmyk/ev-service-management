// Compatibility layer for legacy imports expecting `../services/apiService`
import apiService, * as baseExports from './api';

const { accountRecoveryService } = baseExports;

if (accountRecoveryService) {
  accountRecoveryService.validateResetToken = async (token, email) => {
    const query = new URLSearchParams({ token, email }).toString();
    return apiService.request(`/account/validate-reset-token?${query}`, {
      method: 'GET',
      auth: false,
    });
  };

  accountRecoveryService.resetPassword = async ({
    email,
    token,
    newPassword,
    confirmPassword,
  }) => {
    return apiService.request('/account/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email,
        token,
        newPassword,
        confirmPassword,
      }),
      auth: false,
    });
  };
}

export default apiService;
export * from './api';
