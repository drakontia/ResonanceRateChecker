import type React from "react"
import { Fade, Card, CardContent, Typography } from "@mui/material"
import { Link } from "lucide-react"

export function Title({ children }: { children?: React.ReactNode }) {
    return (
        <Fade in timeout={800}>
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', position: 'relative' }}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                {children}
            </div>
            <Typography 
                variant="h3" 
                component="h1" 
                sx={{ fontWeight: "bold", mb: 1, fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}
            >
                🚀 レゾナンス：無限号列車 相場チェッカー
            </Typography>
            <Typography 
                variant="h6" 
                sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}
            >
                リアルタイム商品価格表示
            </Typography>
            </CardContent>
        </Card>
        </Fade>
    )
}