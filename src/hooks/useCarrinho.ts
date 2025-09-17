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

  const fetchCarrinho = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/carrinho')
      if (!response.ok) {
        if (response.status === 403) {
          // Usuário não é cliente, carrinho vazio
          setItens([])
          setTotalItens(0)
          return
        }
        throw new Error('Erro ao carregar carrinho')
      }
      
      const data = await response.json()
      const itensArray = Array.isArray(data) ? data : []
      setItens(itensArray)
      
      // Calcular total de itens
      const total = itensArray.reduce((sum: number, item: CarrinhoItem) => sum + item.quantidade, 0)
      setTotalItens(total)
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error)
      setItens([])
      setTotalItens(0)
    } finally {
      setLoading(false)
    }
  }, [])

  const adicionarItem = async (produtoId: string, quantidade: number = 1) => {
    try {
      const response = await fetch('/api/carrinho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtoId, quantidade })
      })

      if (!response.ok) throw new Error('Erro ao adicionar item')

      // Recarregar carrinho
      await fetchCarrinho()
      return true
    } catch (error) {
      console.error('Erro ao adicionar item:', error)
      return false
    }
  }

  const removerItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/carrinho/${itemId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao remover item')

      // Recarregar carrinho
      await fetchCarrinho()
      return true
    } catch (error) {
      console.error('Erro ao remover item:', error)
      return false
    }
  }

  const atualizarQuantidade = async (itemId: string, quantidade: number) => {
    try {
      const response = await fetch(`/api/carrinho/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade })
      })

      if (!response.ok) throw new Error('Erro ao atualizar item')

      // Recarregar carrinho
      await fetchCarrinho()
      return true
    } catch (error) {
      console.error('Erro ao atualizar item:', error)
      return false
    }
  }

  const limparCarrinho = async () => {
    try {
      const response = await fetch('/api/carrinho', {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao limpar carrinho')

      setItens([])
      setTotalItens(0)
      return true
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error)
      return false
    }
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
