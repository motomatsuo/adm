const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    // Remover barra no final da URL base para evitar barras duplas
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.loadToken()
  }

  private loadToken() {
    this.token = localStorage.getItem('auth_token')
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Garantir que o endpoint comece com /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${this.baseUrl}${normalizedEndpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        return { error: data.error || 'Erro na requisição' }
      }

      const responseData = await response.json()
      // Se a resposta já tem uma propriedade 'data', retornamos ela diretamente
      // Caso contrário, retornamos a resposta completa
      return { data: responseData.data !== undefined ? responseData.data : responseData }
    } catch (error: any) {
      if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        return { error: 'Backend não está rodando. Verifique se o servidor está iniciado.' }
      }
      return { error: error.message || 'Erro de conexão' }
    }
  }

  async signIn(email: string, password: string) {
    const result = await this.request<{
      user: { id: string; email: string; nome: string; funcao: string; foto_perfil: string | null }
      session: { access_token: string }
    }>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (result.data?.session?.access_token) {
      this.setToken(result.data.session.access_token)
    }

    return result
  }

  async signOut() {
    const result = await this.request('/api/auth/signout', {
      method: 'POST',
    })
    this.setToken(null)
    return result
  }

  async getSession() {
    return this.request<{ user: { id: string; email: string; nome: string; funcao: string; foto_perfil: string | null } }>(
      '/api/auth/session'
    )
  }

  async getRFV() {
    return this.request<{
      id: number
      codigo: string
      nome_empresa: string
      vendedor: string | null
      qtd_pedido: number
      fat_total: number
      ticket_medio: number
      pri_compra: string | null
      ult_compra: string | null
      int_compra: number | null
      dduc: number | null
      recencia: number
      frequencia: number
      valor: number
      media_nota: number | null
      status: string | null
      acao: string | null
      ranking: string | null
      rec_freq: number | null
      id_atendente: number | null
      documento: string | null
      cs_ativo: boolean | null
      classificacao: string | null
      descricao: string | null
      tp_comercio: string | null
    }[]>('/api/rfv')
  }

  async getRFVById(id: number) {
    return this.request<{
      id: number
      codigo: string
      nome_empresa: string
      vendedor: string | null
      qtd_pedido: number
      fat_total: number
      ticket_medio: number
      pri_compra: string | null
      ult_compra: string | null
      int_compra: number | null
      dduc: number | null
      recencia: number
      frequencia: number
      valor: number
      media_nota: number | null
      status: string | null
      acao: string | null
      ranking: string | null
      rec_freq: number | null
      id_atendente: number | null
      documento: string | null
      cs_ativo: boolean | null
      classificacao: string | null
      descricao: string | null
      tp_comercio: string | null
    }>(`/api/rfv/${id}`)
  }

  async getRFVClassificacao(valor?: number | null, status?: string | null) {
    const params = new URLSearchParams()
    if (valor !== null && valor !== undefined) params.append('valor', valor.toString())
    if (status) params.append('status', status)
    const url = params.toString() ? `/api/rfv/classificacao?${params.toString()}` : '/api/rfv/classificacao'
    return this.request<{ classificacao: string; descricao: string; quantidade: number }[]>(url)
  }

  async getRFVValor(classificacao?: string | null, status?: string | null) {
    const params = new URLSearchParams()
    if (classificacao) params.append('classificacao', classificacao)
    if (status) params.append('status', status)
    const url = params.toString() ? `/api/rfv/valor?${params.toString()}` : '/api/rfv/valor'
    return this.request<{ valor: number; quantidade: number }[]>(url)
  }

  async getRFVRecenciaFrequencia(classificacao?: string | null, valor?: number | null, status?: string | null) {
    const params = new URLSearchParams()
    if (classificacao) params.append('classificacao', classificacao)
    if (valor !== null && valor !== undefined) params.append('valor', valor.toString())
    if (status) params.append('status', status)
    const url = params.toString() ? `/api/rfv/recencia-frequencia?${params.toString()}` : '/api/rfv/recencia-frequencia'
    return this.request<{ recencia: number; frequencia: number; quantidade: number }[]>(url)
  }

  async getRFVStatus(classificacao?: string | null, valor?: number | null) {
    const params = new URLSearchParams()
    if (classificacao) params.append('classificacao', classificacao)
    if (valor !== null && valor !== undefined) params.append('valor', valor.toString())
    const url = params.toString() ? `/api/rfv/status?${params.toString()}` : '/api/rfv/status'
    return this.request<{ status: string; quantidade: number }[]>(url)
  }

  async getGeoloc(rfv?: boolean) {
    const url = rfv ? '/api/geoloc?rfv=true' : '/api/geoloc'
    return this.request<{ id: number; id_cliente: string; lat: number; lon: number }[]>(url)
  }

  async getRFVByCodigos(codigos: string[]) {
    return this.request<{
      codigo: string
      nome_empresa: string
      vendedor: string | null
      fat_total: number
      ticket_medio: number
      recencia: number
      frequencia: number
      valor: number
      status: string | null
      classificacao: string | null
      descricao: string | null
    }[]>('/api/rfv/by-codigos', {
      method: 'POST',
      body: JSON.stringify({ codigos }),
    })
  }
}

export const apiClient = new ApiClient(API_URL)
