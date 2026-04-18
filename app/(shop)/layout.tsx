import Header from '@/components/shop/Header'
import Footer from '@/components/shop/Footer'
import FloatingInquiryButton from '@/components/shop/FloatingInquiryButton'
import AuthProvider from '@/components/shop/AuthProvider'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingInquiryButton />
    </AuthProvider>
  )
}
