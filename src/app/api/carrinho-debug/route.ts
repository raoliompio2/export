import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  console.log('🛒 GET carrinho-debug - iniciando...')
  
  try {
    console.log('🛒 GET carrinho-debug - SUCCESS')
    return NextResponse.json({ message: 'GET funcionando', items: [] })
  } catch (error) {
    console.error('🛒 GET carrinho-debug - ERROR:', error)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('🛒 POST carrinho-debug - iniciando...')
  
  try {
    const body = await request.json()
    console.log('🛒 POST carrinho-debug - body:', body)
    
    console.log('🛒 POST carrinho-debug - SUCCESS')
    return NextResponse.json({ message: 'POST funcionando', received: body })
  } catch (error) {
    console.error('🛒 POST carrinho-debug - ERROR:', error)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
