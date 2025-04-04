
import { supabase } from '@/integrations/supabase/client'
import { Product } from '@/types'

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  // Map database field 'imageurl' to 'imageUrl' expected by the Product type
  return data ? data.map(item => ({
    ...item,
    imageUrl: item.imageurl
  })) as Product[] : []
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  // If category is 'all', fetch all products without filtering by category
  let query = supabase.from('products').select('*')
  
  if (category !== 'all') {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching products by category:', error)
    return []
  }
  
  // Map database field 'imageurl' to 'imageUrl' expected by the Product type
  return data ? data.map(item => ({
    ...item,
    imageUrl: item.imageurl
  })) as Product[] : []
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching product by id:', error)
    return null
  }
  
  // Map database field 'imageurl' to 'imageUrl' expected by the Product type
  return data ? {
    ...data,
    imageUrl: data.imageurl
  } as Product : null
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .limit(4)
  
  if (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
  
  // Map database field 'imageurl' to 'imageUrl' expected by the Product type
  return data ? data.map(item => ({
    ...item,
    imageUrl: item.imageurl
  })) as Product[] : []
}
