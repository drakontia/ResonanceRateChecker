import type React from "react"
import { Fade, Card, CardContent, Typography } from "@mui/material"
import { useIsMobile } from "@/hooks/use-mobile"

export function Title() {
    const isMobile = useIsMobile();
    
    return (
        <Fade in timeout={800}>
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
            <Typography 
                variant="h3" 
                component="h1" 
                sx={{ fontWeight: "bold", mb: 1, fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3rem' } }}
            >
                {isMobile ? '相場チェッカー' : '🚀 レゾナンス：無限号列車 相場チェッカー'}
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