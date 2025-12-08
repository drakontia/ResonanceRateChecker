"use client"

import { Box, Typography } from "@mui/material"

export function Footer() {
  return (
    <Box sx={{ mt: 4, py: 3, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" sx={{ opacity: 0.7, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
        © 2024 レゾナンス：無限号列車. All rights reserved.
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.5, fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
        <p>当サイトで表示している価格・取引情報は、『レゾナンス：無限号列車』運営チームより正式に提供された公式APIを利用して取得しています。</p>
        <p>すべてのデータは公式に許可された方法で取得しており、非公式手段や不正なアクセスは一切行っていません。</p>
        <p>本サイトは取得したデータを加工し、利用者が閲覧しやすい形式で表示しています。</p>
      </Typography>
    </Box>
  )
}