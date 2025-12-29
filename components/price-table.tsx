"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material"
import { ArrowUpward, ArrowDownward, TrendingUp, TrendingDown, TrendingFlat } from "@mui/icons-material"
import { cityDb } from "@/lib/cityDb"
import { Station } from "@/types/trade"

interface PriceTableProps {
  filteredItems: string[]
  filteredStations: string[]
  commodityData: Record<string, Record<string, { price: number; trend: number }>>
  tradeData: Record<string, string>
  sortOrder: "asc" | "desc"
  toggleSort: () => void
}

export function PriceTable({ 
  filteredItems, 
  filteredStations, 
  commodityData, 
  tradeData,
  sortOrder, 
  toggleSort 
}: PriceTableProps) {
  const getStationName = (stationId: string) => {
    return cityDb[stationId] || stationId;
  };
  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        maxHeight: { xs: "calc(100vh - 150px)", md: "calc(100vh - 200px)" }, 
        boxShadow: 6,
        borderRadius: 3,
        overflow: 'auto',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell 
              sx={{ 
                fontWeight: "bold", 
                background: (theme) => theme.palette.mode === 'dark' 
                  ? 'linear-gradient(90deg, #424242 0%, #616161 100%)'
                  : 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)',
                minWidth: { xs: 120, md: 160 },
                cursor: "pointer",
                transition: 'all 0.2s ease',
                position: "sticky",
                left: 0,
                zIndex: 2,
                "&:hover": { 
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(90deg, #616161 0%, #757575 100%)'
                    : 'linear-gradient(90deg, #e9ecef 0%, #dee2e6 100%)',
                  transform: 'translateY(-1px)'
                }
              }}
              onClick={toggleSort}
            >
              <Tooltip title={`Sort by price (${sortOrder === 'asc' ? 'ascending' : 'descending'})`}>
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 } }}>
                  <Typography sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                    📦 商品
                  </Typography>
                  <IconButton size="small" sx={{ color: 'primary.main', p: { xs: 0.5, md: 1 } }}>
                    {sortOrder === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                  </IconButton>
                </Box>
              </Tooltip>
            </TableCell>

            {filteredStations.map((stationId, index) => (
              <TableCell
                key={stationId}
                align="center"
                sx={{ 
                  fontWeight: "bold", 
                  background: (theme) => theme.palette.mode === 'dark'
                    ? `linear-gradient(90deg, hsl(${200 + index * 20}, 20%, 25%) 0%, hsl(${200 + index * 20}, 15%, 30%) 100%)`
                    : `linear-gradient(90deg, hsl(${200 + index * 20}, 20%, 95%) 0%, hsl(${200 + index * 20}, 15%, 90%) 100%)`,
                  minWidth: { xs: 80, md: 100 },
                  borderLeft: '2px solid',
                  borderLeftColor: `hsl(${200 + index * 20}, 40%, 70%)`
                }}
              >
                <Typography sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
                  🏪 {getStationName(stationId)}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {(() => {
            const groupedItems = filteredItems.reduce((acc, itemId) => {
              const goodsJp = tradeData[itemId] || itemId;
              if (!acc[goodsJp]) {
                acc[goodsJp] = [];
              }
              acc[goodsJp].push(itemId);
              return acc;
            }, {} as Record<string, string[]>);

            return Object.entries(groupedItems).map(([goodsJp, itemIds]) => {
              const allPrices = itemIds.flatMap(itemId => 
                filteredStations
                  .map(sid => commodityData[itemId]?.[sid]?.price)
                  .filter(Number.isFinite)
              );
              const minPrice = Math.min(...allPrices);
              const maxPrice = Math.max(...allPrices);

              return (
                <TableRow 
                  key={goodsJp}
                  hover 
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'scale(1.001)'
                    }
                  }}
                >
                  <TableCell 
                    sx={{ 
                      fontWeight: "bold",
                      position: "sticky",
                      left: 0,
                      backgroundColor: (theme) => theme.palette.background.paper,
                      zIndex: 1,
                      borderRight: '2px solid',
                      borderRightColor: 'divider'
                    }}
                  >
                    <Chip 
                      label={goodsJp}
                      variant="filled" 
                      size="small"
                      sx={{ 
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.7rem', md: '0.8rem' },
                        height: { xs: 24, md: 32 }
                      }} 
                    />
                  </TableCell>

                  {filteredStations.map((stationId) => {
                    const stationInfos = itemIds
                      .map(itemId => commodityData[itemId]?.[stationId])
                      .filter(Boolean);
                    
                    if (stationInfos.length === 0) {
                      return (
                        <TableCell
                          key={`${stationId}-${goodsJp}`}
                          align="center"
                          sx={{ color: "text.disabled" }}
                        >
                          -
                        </TableCell>
                      );
                    }

                    const bestInfo = stationInfos.reduce((best, current) => 
                      current.price < best.price ? current : best
                    );

                    const getTrendIcon = () => {
                      if (bestInfo.trend === 1) return <TrendingUp fontSize="small" />;
                      if (bestInfo.trend === -1) return <TrendingDown fontSize="small" />;
                      return <TrendingFlat fontSize="small" />;
                    };

                    const trendColor =
                      bestInfo.trend === 1
                        ? "error.main"
                        : bestInfo.trend === -1
                        ? "success.main"
                        : "text.secondary";

                    let bgColor: string | ((theme: { palette: { mode: string } }) => string) = "transparent";
                    let borderColor = "transparent";
                    if (bestInfo.price === minPrice) {
                      bgColor = (theme: { palette: { mode: string } }) => theme.palette.mode === 'dark'
                        ? "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)"
                        : "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)";
                      borderColor = "success.main";
                    } else if (bestInfo.price === maxPrice) {
                      bgColor = (theme: { palette: { mode: string } }) => theme.palette.mode === 'dark'
                        ? "linear-gradient(135deg, #b71c1c 0%, #d32f2f 100%)"
                        : "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)";
                      borderColor = "error.main";
                    }

                    return (
                      <Tooltip key={`${stationId}-${goodsJp}`} title={`Trend: ${bestInfo.trend === 1 ? 'Rising' : bestInfo.trend === -1 ? 'Falling' : 'Stable'}`}>
                        <TableCell
                          align="center"
                          sx={{
                            color: trendColor,
                            background: bgColor,
                            fontWeight: "bold",
                            borderTop: '2px solid',
                            borderTopColor: borderColor,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: { xs: 0.2, md: 0.5 },
                            flexDirection: { xs: 'column', sm: 'row' }
                          }}>
                            {getTrendIcon()}
                            <Typography sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
                              💰{bestInfo.price}
                            </Typography>
                          </Box>
                        </TableCell>
                      </Tooltip>
                    );
                  })}
                </TableRow>
              );
            });
          })()}
        </TableBody>
      </Table>
    </TableContainer>
  )
}