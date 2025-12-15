import { redirect } from 'next/navigation'

export default function AddressRedirect({ params }: { params: { id: string } & Promise<any> }) {
  const { id } = params

  // Redirect to the paginated route with default values
  redirect(`/address/${id}/20/1`)
}
