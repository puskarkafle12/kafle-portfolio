import { LINKEDIN_URL } from '@/config/site.js'

export const featuredProjects = [
  {
    title: 'Multimodal Stress Prediction Research',
    summary:
      'Graduate research from my first semester at Texas Tech University focused on multimodal stress prediction using wearable data and machine learning.',
    tech: 'Python, Multimodal AI, Graduate Research',
    link: 'https://github.com/puskarkafle12/multimodal-stress-detection-from-wearables',
    featured: true,
  },
  {
    title: 'Bulk IPO Workflow Automation',
    summary:
      'High-impact IPO workflow automation platform focused on speed, reliability, and scalable execution flows.',
    tech: 'JavaScript, Automation',
    link: 'https://github.com/puskarkafle12/bulk-ipo',
  },
  {
    title: 'Stock Market Prediction (RNN / LSTM)',
    summary:
      'Stock market forecasting project exploring RNN and LSTM approaches for predictive modeling.',
    tech: 'Python, Deep Learning, Time-Series',
    link: 'https://github.com/puskarkafle12/stock_market_prediction',
  },
]

/** Contact row for hero + contact section */
export const quickContactItems = [
  {
    id: 'email',
    label: 'Email',
    value: 'puskarkafle2031@gmail.com',
    href: 'mailto:puskarkafle2031@gmail.com',
  },
  {
    id: 'phone',
    label: 'Phone',
    value: '+1 (806) 441-9487',
    copyValue: '+18064419487',
    href: 'tel:+18064419487',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: 'linkedin.com/in/puskarkafle',
    href: LINKEDIN_URL,
  },
]

/** Work, education, and certification entries for the Experience section */
export const timelineData = [
  {
    type: 'work',
    title: 'Software Engineer',
    org: 'Deerhold Ltd.',
    location: 'Kathmandu, Nepal',
    date: 'Feb 2023 - Aug 2025',
    bullets: [
      'Built an ETL big-data engine from scratch using PySpark and algorithmic approaches (Tree, DFS, BFS) to preprocess healthcare data.',
      "Automated Japanese press release generation by fine-tuning LLMs, integrating vector search, and implementing RAG architecture.",
      'Developed Flask-based backend services and web scraping pipelines for reliable data acquisition and processing.',
    ],
    stack:
      'PyTorch, TensorFlow, scikit-learn, Pandas, PySpark, Flask, FastAPI, AWS Glue, EC2, S3, MongoDB, MySQL',
  },
  {
    type: 'work',
    title: 'Associate Software Engineer',
    org: 'Suga Inc. Pvt. Ltd.',
    location: 'Kathmandu, Nepal',
    date: 'Oct 2021 - Jan 2023',
    bullets: [
      'Developed AI-based stock sentiment analysis pipelines using tokenization, lemmatization, and BERT embeddings.',
      'Scraped real-time and historical financial news data using Beautiful Soup and Selenium.',
      'Built FastAPI services for real-time prediction workflows and backend automation.',
    ],
    stack: 'Python, Web Scraping, Pandas, BERT, Flask, scikit-learn',
  },
  {
    type: 'work',
    title: 'Python/ML Trainer',
    org: 'VS International College, College of Applied Business',
    location: 'Kathmandu, Nepal',
    date: 'Jul 2021 - Aug 2021',
    bullets: [
      'Taught elective Python and machine learning courses for final-year BCA students.',
      'Conducted labs, clarified ML concepts, and guided hands-on programming assignments.',
    ],
    stack: 'Python, Machine Learning, Mentorship',
  },
  {
    type: 'education',
    title: 'M.S. in Computer Science (Pursuing)',
    org: 'Prairie View A&M University',
    location: 'Prairie View, Texas',
    date: 'Jan 2026 - May 2027',
    bullets: ['Graduate studies focused on advanced computing and applied AI systems.'],
    stack: 'Graduate Studies',
  },
  {
    type: 'education',
    title: 'Graduate Coursework in Computer Science',
    org: 'Texas Tech University',
    location: 'Lubbock, Texas',
    date: 'Aug 2025 - Dec 2025',
    bullets: [
      'Completed one semester of graduate coursework including Intelligent Systems and Deep Learning.',
      'Conducted independent research on Type 2 Diabetes prediction using multimodal AI under Professor Victor Sheng.',
    ],
    stack: 'Intelligent Systems, Deep Learning, Research',
  },
  {
    type: 'education',
    title: "Bachelor's in Computer Science",
    org: 'Tribhuvan University',
    location: 'Lalitpur, Nepal',
    date: 'Aug 2018 - Aug 2022',
    bullets: [
      'Graduated with 76% overall, 81% in final two years, and achieved topper recognition twice.',
      'Organized Python workshops for junior-level students.',
      'Final projects included GAN-based virtual try-on, stock market price scraper, and stock ordering bot.',
    ],
    stack: 'Computer Science, GANs, Python',
  },
  {
    type: 'certification',
    title: 'Micro Degree in Machine Learning',
    org: 'Fusemachines Nepal Pvt. Ltd.',
    location: 'Kathmandu, Nepal',
    date: 'Jan 2022 - May 2022',
    bullets: [
      'Built projects on accident severity prediction and LSTM-based stock market forecasting.',
      'Covered supervised and unsupervised learning, RL, CNNs, RNNs, GANs, transfer learning, and NLP.',
    ],
    stack: 'PyTorch, TensorFlow, LSTM, NLP',
  },
]
