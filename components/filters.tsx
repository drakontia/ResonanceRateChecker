"use client"

import { 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  OutlinedInput, 
  Box, 
  Chip 
} from "@mui/material"

interface FiltersProps {
  itemFilter: string
  setItemFilter: (value: string) => void
  stationFilter: string[]
  setStationFilter: (value: string[]) => void
  allStationIds: string[]
}

export function Filters({ 
  itemFilter, 
  setItemFilter, 
  stationFilter, 
  setStationFilter, 
  allStationIds 
}: FiltersProps) {
  return (
    <>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="🔍 Item Filter"
          value={itemFilter}
          onChange={(e) => setItemFilter(e.target.value)}
          size="small"
          placeholder="Enter item name..."
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth size="small">
          <InputLabel>🏪 Station Filter</InputLabel>
          <Select
            multiple
            value={stationFilter}
            onChange={(e) => setStationFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            input={<OutlinedInput label="🏪 Station Filter" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {allStationIds.map((stationId) => (
              <MenuItem key={stationId} value={stationId}>
                {stationId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  )
}