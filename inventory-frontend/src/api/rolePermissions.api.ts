import axiosInstance from './axiosInstance'

export const rolesApi = {
  getAll: () => axiosInstance.get('/roles').then(r => r.data),
  updatePermissions: (roleId: string, permissionIds: string[]) =>
    axiosInstance.put(`/roles/${roleId}/permissions`, { permissionIds }).then(r => r.data),
}

export const permissionsApi = {
  getAll: () => axiosInstance.get('/permissions').then(r => r.data),
}
