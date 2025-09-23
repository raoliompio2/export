'use client'

import { useState, useEffect, useCallback } from 'react'

interface CarrinhoItem {
  id: string
  quantidade: number
  observacoes?: string
  produto: {
    id: string
    nome: string
    codigo: string
    preco: number
    precoPromocional?: number
    unidade: string
    imagens: string[]
    categoria: {
      nome: string
    }
    empresa: {
      id: string
      nome: string
    }
  }
}

export function useCarrinho() {
  const [itens, setItens] = useState<CarrinhoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [totalItens, setTotalItens] = useState(0)
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, number>>(new Map())
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set())

  // Calcular total otimizado considerando updates pendentes
  const calcularTotalOtimizado = useCallback((itensAtuais: CarrinhoItem[]) => {
    let total = 0
    itensAtuais.forEach(item => {
      const updatePendente = optimisticUpdates.get(item.id)
      total += updatePendente !== undefined ? updatePendente : item.quantidade
    })
    return total
  }, [optimisticUpdates])

  // Atualizar total quando itens ou updates mudarem
  useEffect(() => {
    const novoTotal = calcularTotalOtimizado(itens)
    setTotalItens(novoTotal)
  }, [itens, calcularTotalOtimizado])

  // Função para evitar requisições duplicadas
  const evitarDuplicacao = useCallback((requestId: string, operation: () => Promise<boolean>) => {
    if (pendingRequests.has(requestId)) {
      console.log(`🛒 Requisição ${requestId} já em andamento, ignorando...`)
      return Promise.resolve(false)
    }

    setPendingRequests(prev => new Set(prev).add(requestId))
    
    return operation().finally(() => {
      setPendingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    })
  }, [pendingRequests])

  const fetchCarrinho = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/carrinho')
      
      if (!response.ok) {
        if (response.status === 403) {
          // Usuário não é cliente, carrinho vazio
          console.log('🛒 Usuário não é cliente - carrinho vazio')
          setItens([])
          setTotalItens(0)
          return
        }
        
        if (response.status === 401) {
          // Usuário não autenticado
          console.log('🛒 Usuário não autenticado - carrinho vazio')
          setItens([])
          setTotalItens(0)
          return
        }
        
        // Outros erros - log detalhado
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
        console.error('🛒 Erro ao carregar carrinho:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        
        // Para outros erros, também definir carrinho vazio em vez de quebrar
        setItens([])
        setTotalItens(0)
        return
      }
      
      const data = await response.json()
      const itensArray = Array.isArray(data) ? data : []
      setItens(itensArray)
      
      // Limpar updates otimísticos quando dados reais chegarem
      setOptimisticUpdates(new Map())
      
      console.log(`🛒 Carrinho carregado: ${itensArray.length} itens`)
    } catch (error) {
      console.error('🛒 Erro ao buscar carrinho:', error)
      // Em caso de erro de rede ou parsing, também definir carrinho vazio
      setItens([])
      setTotalItens(0)
    } finally {
      setLoading(false)
    }
  }, [])

  const adicionarItem = async (produtoId: string, quantidade: number = 1) => {
    return evitarDuplicacao(`add-${produtoId}`, async () => {
      try {
        // Update otimístico: encontrar item existente ou simular novo
        const itemExistente = itens.find(item => item.produto.id === produtoId)
        
        if (itemExistente) {
          // Item já existe - atualizar quantidade otimisticamente
          const novaQuantidade = itemExistente.quantidade + quantidade
          setOptimisticUpdates(prev => new Map(prev.set(itemExistente.id, novaQuantidade)))
        } else {
          // Item novo - simular adição temporária (será confirmado pelo servidor)
          const tempId = `temp-${Date.now()}`
          const tempItem: CarrinhoItem = {
            id: tempId,
            quantidade,
            produto: {
              id: produtoId,
              nome: 'Carregando...',
              codigo: '',
              preco: 0,
              unidade: '',
              imagens: [],
              categoria: { nome: '' },
              empresa: { id: '', nome: '' }
            }
          }
          setItens(prev => [tempItem, ...prev])
          setOptimisticUpdates(prev => new Map(prev.set(tempId, quantidade)))
        }

        const response = await fetch('/api/carrinho', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ produtoId, quantidade })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
          console.error('🛒 Erro ao adicionar item:', {
            status: response.status,
            error: errorData
          })
          
          // Reverter update otimístico em caso de erro
          if (itemExistente) {
            setOptimisticUpdates(prev => {
              const newMap = new Map(prev)
              newMap.delete(itemExistente.id)
              return newMap
            })
          } else {
            // Remover item temporário
            setItens(prev => prev.filter(item => !item.id.startsWith('temp-')))
            setOptimisticUpdates(prev => {
              const newMap = new Map(prev)
              newMap.delete(`temp-${Date.now()}`)
              return newMap
            })
          }
          
          if (response.status === 403) {
            console.log('🛒 Usuário não tem permissão para adicionar ao carrinho')
          }
          
          return false
        }

        // Recarregar carrinho para sincronizar com servidor
        await fetchCarrinho()
        console.log(`🛒 Item adicionado ao carrinho: produtoId=${produtoId}, quantidade=${quantidade}`)
        return true
      } catch (error) {
        console.error('🛒 Erro ao adicionar item:', error)
        
        // Reverter updates otimísticos em caso de erro de rede
        setOptimisticUpdates(new Map())
        await fetchCarrinho() // Recarregar para estado consistente
        
        return false
      }
    })
  }

  const removerItem = async (itemId: string) => {
    return evitarDuplicacao(`remove-${itemId}`, async () => {
      try {
        // Update otimístico: remover item imediatamente
        const itemOriginal = itens.find(item => item.id === itemId)
        setItens(prev => prev.filter(item => item.id !== itemId))
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev)
          newMap.delete(itemId)
          return newMap
        })

        const response = await fetch(`/api/carrinho/${itemId}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
          console.error('🛒 Erro ao remover item:', {
            status: response.status,
            error: errorData
          })
          
          // Reverter update otimístico em caso de erro
          if (itemOriginal) {
            setItens(prev => [itemOriginal, ...prev])
          }
          
          return false
        }

        console.log(`🛒 Item removido do carrinho: itemId=${itemId}`)
        return true
      } catch (error) {
        console.error('🛒 Erro ao remover item:', error)
        
        // Reverter update otimístico em caso de erro de rede
        await fetchCarrinho() // Recarregar para estado consistente
        
        return false
      }
    })
  }

  const atualizarQuantidade = async (itemId: string, quantidade: number) => {
    return evitarDuplicacao(`update-${itemId}`, async () => {
      try {
        // Update otimístico: atualizar quantidade imediatamente
        const quantidadeOriginal = itens.find(item => item.id === itemId)?.quantidade || 0
        setOptimisticUpdates(prev => new Map(prev.set(itemId, quantidade)))

        const response = await fetch(`/api/carrinho/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantidade })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
          console.error('🛒 Erro ao atualizar item:', {
            status: response.status,
            error: errorData
          })
          
          // Reverter update otimístico em caso de erro
          setOptimisticUpdates(prev => {
            const newMap = new Map(prev)
            newMap.delete(itemId)
            return newMap
          })
          
          return false
        }

        console.log(`🛒 Quantidade atualizada: itemId=${itemId}, quantidade=${quantidade}`)
        return true
      } catch (error) {
        console.error('🛒 Erro ao atualizar item:', error)
        
        // Reverter update otimístico em caso de erro de rede
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev)
          newMap.delete(itemId)
          return newMap
        })
        
        return false
      }
    })
  }

  const limparCarrinho = async () => {
    return evitarDuplicacao('clear-cart', async () => {
      try {
        // Update otimístico: limpar carrinho imediatamente
        const itensOriginais = [...itens]
        setItens([])
        setOptimisticUpdates(new Map())

        const response = await fetch('/api/carrinho', {
          method: 'DELETE'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
          console.error('🛒 Erro ao limpar carrinho:', {
            status: response.status,
            error: errorData
          })
          
          // Reverter update otimístico em caso de erro
          setItens(itensOriginais)
          
          return false
        }

        console.log('🛒 Carrinho limpo com sucesso')
        return true
      } catch (error) {
        console.error('🛒 Erro ao limpar carrinho:', error)
        
        // Reverter update otimístico em caso de erro de rede
        await fetchCarrinho() // Recarregar para estado consistente
        
        return false
      }
    })
  }

  useEffect(() => {
    fetchCarrinho()
  }, [fetchCarrinho])

  return {
    itens,
    loading,
    totalItens,
    adicionarItem,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    recarregar: fetchCarrinho
  }
}
