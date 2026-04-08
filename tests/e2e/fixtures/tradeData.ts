export const mockTradeResponse = {
  fetchTime: new Date().toISOString(),
  stations: [
    {
      stationId: "1001",
      buyItems: [
        { itemId: "1", price: 1000, quota: 1.2, is_rise: true, trend: 1, stock: 100 },
        { itemId: "2", price: 800, quota: 0.9, is_rise: false, trend: 0, stock: 50 },
      ],
      sellItems: [],
    },
    {
      stationId: "1002",
      buyItems: [
        { itemId: "1", price: 950, quota: 1.1, is_rise: true, trend: 1, stock: 80 },
        { itemId: "2", price: 820, quota: 0.85, is_rise: false, trend: 0, stock: 60 },
      ],
      sellItems: [],
    },
  ],
};
