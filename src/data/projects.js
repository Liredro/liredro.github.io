// Single source of truth for the project carousel.
// Keep media in public/assets/images/projects/ and update entries here.
export const projects = [
  {
    id: 'credit-risk',
    title: 'Credit Portfolio & Risk Intelligence',
    description: 'An interactive analysis of credit card defaults, repayment behaviour and portfolio risk using Python, SQL and JavaScript.',
    tags: ['SQL', 'Python', 'Finance', 'JavaScript'],
    image: 'credit-risk-dashboard-preview.png',
    imageAlt: 'Credit Risk Analysis dashboard preview',
    github: 'https://github.com/Liredro/credit-risk-intelligence',
    live: 'https://liredro.github.io/credit-risk-intelligence/'
  },
  {
    id: 'equity-research',
    title: 'Equity Research Lab',
    description: "An interactive equity research tool for analysing financial statements, building DCF valuations and exploring how assumptions and scenarios affect a company's intrinsic value.",
    tags: ['Equity Research', 'Financial Modelling', 'DCF'],
    image: 'equity-research-lab-preview.png',
    imageAlt: 'Equity Research Lab dashboard preview',
    github: 'https://github.com/Liredro/equity-research-lab',
    live: 'https://liredro.github.io/equity-research-lab/'
  },
  {
    id: 'bull-bear',
    title: 'Bull vs Bear',
    description: 'Jump over bearish obstacles, collect candlesticks and keep your bull run alive.',
    tags: ['JavaScript', 'Game', 'Web'],
    image: 'bull-vs-bear-preview.png',
    imageAlt: 'Bull vs Bear game preview',
    github: 'https://github.com/Liredro/liredro.github.io',
    play: true
  }
];
