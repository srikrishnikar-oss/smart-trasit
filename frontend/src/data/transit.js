export const smartRoutes = [
  {
    id: '47C',
    name: 'Majestic Bus Stand to Indiranagar',
    mode: 'BUS',
    delayMinutes: 6,
    seatsAvailable: 12,
    totalSeats: 30,
    distanceKm: 11.5,
    estimatedMinutes: 20,
  },
  {
    id: 'L1',
    name: 'Purple Line - Whitefield to Challaghatta',
    mode: 'METRO',
    delayMinutes: 2,
    seatsAvailable: 124,
    totalSeats: 300,
    distanceKm: 43,
    estimatedMinutes: 52,
  },
  {
    id: 'L2',
    name: 'Green Line - Madavara to Silk Institute',
    mode: 'METRO',
    delayMinutes: 0,
    seatsAvailable: 146,
    totalSeats: 300,
    distanceKm: 31,
    estimatedMinutes: 46,
  },
  {
    id: 'YL1',
    name: 'Yellow Line - R V Road to Bommasandra',
    mode: 'METRO',
    delayMinutes: 4,
    seatsAvailable: 98,
    totalSeats: 280,
    distanceKm: 19,
    estimatedMinutes: 34,
  },
]

export const metroSchedule = [
  {
    lineId: 'L1',
    lineName: 'Purple Line',
    accent: 'bg-violet-50 border-violet-200 text-violet-800',
    days: [
      {
        label: 'Monday',
        sections: [
          {
            title: 'From Whitefield',
            rows: [
              { from: '04:15', to: '04:35', frequency: '20 mins' },
              { from: '04:35', to: '05:00', frequency: '13 mins' },
              { from: '05:00', to: '10:57', frequency: '10 mins' },
              { from: '10:57', to: '15:21', frequency: '8 mins' },
              { from: '15:21', to: '22:01', frequency: '10 mins' },
              { from: '22:01', to: '22:45', frequency: '15 mins' },
            ],
          },
          {
            title: 'From Challaghatta',
            rows: [
              { from: '04:15', to: '04:35', frequency: '20 mins' },
              { from: '04:35', to: '05:15', frequency: '15 mins' },
              { from: '05:15', to: '06:54', frequency: '11 mins' },
              { from: '06:54', to: '12:20', frequency: '10 mins' },
              { from: '12:20', to: '16:45', frequency: '8 mins' },
              { from: '16:45', to: '23:05', frequency: '10 mins' },
            ],
          },
          {
            title: 'From Garudacharpalya',
            rows: [
              { from: '06:53', to: '10:55', frequency: '5 mins' },
              { from: '16:10', to: '20:10', frequency: '5 mins' },
            ],
          },
          {
            title: 'From Mysore Road',
            rows: [
              { from: '07:22', to: '10:20', frequency: '5 mins' },
              { from: '16:53', to: '21:02', frequency: '5 mins' },
            ],
          },
        ],
      },
    ],
  },
  {
    lineId: 'L2',
    lineName: 'Green Line',
    accent: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    days: [
      {
        label: 'Monday',
        sections: [
          {
            title: 'From Madavara',
            rows: [
              { from: '04:15', to: '04:40', frequency: '25 mins' },
              { from: '05:00', to: '06:15', frequency: '15 mins' },
              { from: '06:15', to: '10:25', frequency: '10 mins' },
              { from: '10:25', to: '10:39', frequency: '7 mins' },
              { from: '10:39', to: '15:51', frequency: '8 mins' },
              { from: '15:51', to: '19:44', frequency: '10 mins' },
              { from: '19:44', to: '20:24', frequency: '8 mins' },
              { from: '20:24', to: '22:04', frequency: '10 mins' },
              { from: '22:04', to: '22:40', frequency: '10 mins' },
              { from: '22:40', to: '22:57', frequency: '15 mins' },
            ],
          },
          {
            title: 'From Silk Institute',
            rows: [
              { from: '04:15', to: '05:00', frequency: '20 mins' },
              { from: '05:00', to: '07:00', frequency: '15 mins' },
              { from: '07:00', to: '11:09', frequency: '10 mins' },
              { from: '11:09', to: '16:48', frequency: '8 mins' },
              { from: '16:48', to: '20:29', frequency: '10 mins' },
              { from: '20:29', to: '21:30', frequency: '8 mins' },
              { from: '21:30', to: '22:40', frequency: '10 mins' },
              { from: '22:40', to: '23:05', frequency: '12.5 mins' },
            ],
          },
          {
            title: 'From Nagasandra / Peenya Industry',
            rows: [
              { from: '06:37', to: '10:22', frequency: '5 mins' },
              { from: '16:36', to: '19:41', frequency: '5 mins' },
            ],
          },
          {
            title: 'From Yelachenahalli',
            rows: [
              { from: '07:20', to: '10:50', frequency: '5 mins' },
              { from: '16:58', to: '20:22', frequency: '5 mins' },
            ],
          },
        ],
      },
      {
        label: 'Tuesday to Friday',
        sections: [
          {
            title: 'From Madavara',
            rows: [
              { from: '05:00', to: '06:15', frequency: '15 mins' },
              { from: '06:15', to: '10:25', frequency: '11 mins' },
              { from: '10:25', to: '10:39', frequency: '7 mins' },
              { from: '10:39', to: '15:51', frequency: '8 mins' },
              { from: '15:51', to: '19:44', frequency: '10 mins' },
              { from: '19:44', to: '20:24', frequency: '8 mins' },
              { from: '20:24', to: '22:04', frequency: '10 mins' },
              { from: '22:04', to: '22:40', frequency: '10 mins' },
              { from: '22:40', to: '22:57', frequency: '15 mins' },
            ],
          },
          {
            title: 'From Silk Institute',
            rows: [
              { from: '05:00', to: '07:00', frequency: '15 mins' },
              { from: '07:00', to: '11:09', frequency: '10 mins' },
              { from: '11:09', to: '16:48', frequency: '8 mins' },
              { from: '16:48', to: '20:29', frequency: '10 mins' },
              { from: '20:29', to: '21:30', frequency: '8 mins' },
              { from: '21:30', to: '22:40', frequency: '10 mins' },
              { from: '22:40', to: '23:05', frequency: '12.5 mins' },
            ],
          },
          {
            title: 'From Nagasandra / Peenya Industry',
            rows: [
              { from: '06:37', to: '10:22', frequency: '5 mins' },
              { from: '16:36', to: '19:41', frequency: '5 mins' },
            ],
          },
          {
            title: 'From Yelachenahalli',
            rows: [
              { from: '07:20', to: '10:50', frequency: '5 mins' },
              { from: '16:58', to: '20:22', frequency: '5 mins' },
            ],
          },
        ],
      },
    ],
  },
  {
    lineId: 'YL1',
    lineName: 'Yellow Line',
    accent: 'bg-amber-50 border-amber-200 text-amber-800',
    days: [
      {
        label: 'Monday',
        sections: [
          {
            title: 'From R V Road',
            rows: [
              { from: '05:05', to: '05:35', frequency: '30 mins' },
              { from: '05:35', to: '06:00', frequency: '25 mins' },
              { from: '06:00', to: '06:40', frequency: '20 mins' },
              { from: '06:40', to: '06:56', frequency: '16 mins' },
              { from: '06:56', to: '07:07', frequency: '11 mins' },
              { from: '07:07', to: '07:37', frequency: '10 mins' },
              { from: '07:37', to: '10:55', frequency: '9 mins' },
              { from: '10:55', to: '11:06', frequency: '11 mins' },
              { from: '11:06', to: '16:42', frequency: '14 mins' },
              { from: '16:42', to: '22:06', frequency: '9 mins' },
              { from: '22:06', to: '22:30', frequency: '12 mins' },
              { from: '22:30', to: '23:15', frequency: '15 mins' },
            ],
          },
          {
            title: 'From Bommasandra',
            rows: [
              { from: '05:05', to: '05:35', frequency: '30 mins' },
              { from: '05:35', to: '06:00', frequency: '25 mins' },
              { from: '06:00', to: '06:20', frequency: '20 mins' },
              { from: '06:20', to: '07:00', frequency: '10 mins' },
              { from: '07:00', to: '10:18', frequency: '9 mins' },
              { from: '10:18', to: '10:30', frequency: '12 mins' },
              { from: '10:30', to: '16:06', frequency: '14 mins' },
              { from: '16:06', to: '22:42', frequency: '9 mins' },
            ],
          },
        ],
      },
    ],
  },
]

export const passes = [
  {
    id: 'P001',
    type: 'Monthly Pass',
    status: 'ACTIVE',
    validFrom: '2026-03-12',
    validTo: '2026-03-20',
    routes: 'BMTC and Namma Metro city network',
    price: 'Rs.500',
    color: 'bg-blue-600',
  },
  {
    id: 'P002',
    type: 'Metro Weekly Pass',
    status: 'EXPIRED',
    validFrom: '2026-03-01',
    validTo: '2026-03-07',
    routes: 'Purple, Green and Yellow lines',
    price: 'Rs.150',
    color: 'bg-gray-400',
  },
]
