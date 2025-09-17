import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.' },
        { status: 400 }
      )
    }

    // Validar tamanho (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 5MB' },
        { status: 400 }
      )
    }

    // Por enquanto, vamos simular o upload retornando uma URL fictícia
    // Em produção, você faria upload para AWS S3, Cloudinary, etc.
    const timestamp = Date.now()
    const fileName = `avatar-${user.id}-${timestamp}.${file.type.split('/')[1]}`
    const avatarUrl = `https://picsum.photos/200/200?random=${timestamp}`

    // Atualizar avatar no banco de dados
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: avatarUrl },
    })

    return NextResponse.json({
      message: 'Avatar atualizado com sucesso',
      avatarUrl,
    })
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
