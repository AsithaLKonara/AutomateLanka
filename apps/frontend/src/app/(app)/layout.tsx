import N8nLayout from '@/components/layout/N8nLayout'

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <N8nLayout>
            {children}
        </N8nLayout>
    )
}
