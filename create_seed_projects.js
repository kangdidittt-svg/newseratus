import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = 'freelance-trackers';

// Sample project data
const seedProjects = [
  {
    title: "E-commerce Website Redesign",
    client: "TechCorp Solutions",
    description: "Complete redesign of the company's e-commerce platform with modern UI/UX, mobile responsiveness, and improved checkout flow.",
    budget: 8500,
    deadline: new Date('2024-03-15'),
    status: "active",
    priority: "high",
    category: "Web Development",
    hoursWorked: 45,
    hourlyRate: 75,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    userId: "user123" // You may need to adjust this based on your user system
  },
  {
    title: "Mobile App Development",
    client: "StartupXYZ",
    description: "Native iOS and Android app for food delivery service with real-time tracking and payment integration.",
    budget: 12000,
    deadline: new Date('2024-04-30'),
    status: "active",
    priority: "high",
    category: "Mobile Development",
    hoursWorked: 32,
    hourlyRate: 80,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-18'),
    userId: "user123"
  },
  {
    title: "Brand Identity Design",
    client: "Green Earth Co.",
    description: "Complete brand identity package including logo design, color palette, typography, and brand guidelines.",
    budget: 3500,
    deadline: new Date('2024-02-28'),
    status: "completed",
    priority: "medium",
    category: "Design",
    hoursWorked: 28,
    hourlyRate: 65,
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-01-15'),
    userId: "user123"
  },
  {
    title: "Database Migration",
    client: "DataFlow Inc.",
    description: "Migrate legacy database to modern cloud infrastructure with data validation and performance optimization.",
    budget: 6200,
    deadline: new Date('2024-03-10'),
    status: "active",
    priority: "high",
    category: "Backend Development",
    hoursWorked: 38,
    hourlyRate: 85,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-22'),
    userId: "user123"
  },
  {
    title: "SEO Optimization",
    client: "Local Business Hub",
    description: "Comprehensive SEO audit and optimization for improved search engine rankings and organic traffic.",
    budget: 2800,
    deadline: new Date('2024-02-20'),
    status: "on-hold",
    priority: "medium",
    category: "Digital Marketing",
    hoursWorked: 15,
    hourlyRate: 60,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19'),
    userId: "user123"
  },
  {
    title: "API Development",
    client: "FinTech Solutions",
    description: "RESTful API development for financial data processing with security compliance and documentation.",
    budget: 9500,
    deadline: new Date('2024-04-15'),
    status: "active",
    priority: "high",
    category: "Backend Development",
    hoursWorked: 42,
    hourlyRate: 90,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-21'),
    userId: "user123"
  },
  {
    title: "WordPress Theme Customization",
    client: "Creative Agency",
    description: "Custom WordPress theme development with advanced features and responsive design for creative portfolio.",
    budget: 4200,
    deadline: new Date('2024-03-05'),
    status: "completed",
    priority: "medium",
    category: "Web Development",
    hoursWorked: 35,
    hourlyRate: 70,
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2024-01-10'),
    userId: "user123"
  },
  {
    title: "UI/UX Design System",
    client: "SaaS Platform",
    description: "Comprehensive design system with reusable components, style guide, and prototyping for SaaS dashboard.",
    budget: 7800,
    deadline: new Date('2024-03-25'),
    status: "active",
    priority: "medium",
    category: "Design",
    hoursWorked: 29,
    hourlyRate: 75,
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-17'),
    userId: "user123"
  },
  {
    title: "DevOps Infrastructure Setup",
    client: "CloudTech Systems",
    description: "Complete DevOps pipeline setup with CI/CD, containerization, and monitoring for scalable deployment.",
    budget: 11000,
    deadline: new Date('2024-04-20'),
    status: "active",
    priority: "high",
    category: "DevOps",
    hoursWorked: 48,
    hourlyRate: 95,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-23'),
    userId: "user123"
  },
  {
    title: "Content Management System",
    client: "Publishing House",
    description: "Custom CMS development for managing articles, authors, and publications with editorial workflow.",
    budget: 5600,
    deadline: new Date('2024-02-15'),
    status: "completed",
    priority: "medium",
    category: "Web Development",
    hoursWorked: 40,
    hourlyRate: 70,
    createdAt: new Date('2023-12-10'),
    updatedAt: new Date('2024-01-05'),
    userId: "user123"
  }
];

async function createSeedProjects() {
  if (!uri) {
    console.error('MONGODB_URI is not defined in .env.local');
    return;
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const projectsCollection = db.collection('projects');
    
    // Check if projects already exist
    const existingCount = await projectsCollection.countDocuments();
    console.log(`Found ${existingCount} existing projects`);
    
    if (existingCount > 0) {
      console.log('Projects already exist. Skipping seed creation.');
      console.log('If you want to recreate seed data, please clear the collection first.');
      return;
    }
    
    // Insert seed projects
    const result = await projectsCollection.insertMany(seedProjects);
    console.log(`Successfully inserted ${result.insertedCount} seed projects`);
    
    // Display inserted projects
    console.log('\nInserted projects:');
    seedProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title} - ${project.client} (${project.status})`);
    });
    
    // Show summary statistics
    const statusCounts = {};
    seedProjects.forEach(project => {
      statusCounts[project.status] = (statusCounts[project.status] || 0) + 1;
    });
    
    console.log('\nProject Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`- ${status}: ${count} projects`);
    });
    
    const totalBudget = seedProjects.reduce((sum, project) => sum + project.budget, 0);
    console.log(`\nTotal Budget: $${totalBudget.toLocaleString()}`);
    
  } catch (error) {
    console.error('Error creating seed projects:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  createSeedProjects();
}

export { createSeedProjects, seedProjects };