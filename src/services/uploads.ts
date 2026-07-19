import { api } from './apiClient'

export const uploadService = {
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.postForm<{ url: string }>('/uploads/avatar', form)
  },
}
