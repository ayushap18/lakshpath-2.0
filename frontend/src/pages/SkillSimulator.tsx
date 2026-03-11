import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Icon from '../components/ui/Icon';
import StatCard from '../components/ui/StatCard';
import ProgressBar from '../components/ui/ProgressBar';
import Input from '../components/ui/Input';
import { featuresAPI } from '../services/api';

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                 */
/* ------------------------------------------------------------------ */

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 140, damping: 20 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 22 },
  },
};

/* ------------------------------------------------------------------ */
/*  Type Definitions                                                   */
/* ------------------------------------------------------------------ */

interface Skill {
  name: string;
  category: 'Languages' | 'Frameworks' | 'Tools' | 'Soft Skills' | 'Core' | 'Data' | 'Cloud' | 'Design';
  requiredLevel: number;
  currentLevel: number;
}

interface Resource {
  name: string;
  type: 'course' | 'certification' | 'project' | 'book';
  platform: string;
  duration: string;
}

interface SkillGap {
  skill: Skill;
  gap: number;
  gapPercent: number;
  priority: 'critical' | 'important' | 'nice-to-have';
  estimatedHours: number;
  resources: Resource[];
}

interface RoleDefinition {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  skills: Skill[];
  avgSalary: string;
  demand: 'High' | 'Very High' | 'Medium';
}

/* ------------------------------------------------------------------ */
/*  Comprehensive Mock Data                                            */
/* ------------------------------------------------------------------ */

const roleDefinitions: RoleDefinition[] = [
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    icon: 'code',
    color: '#0066FF',
    description: 'Build end-to-end web applications with modern frameworks',
    avgSalary: '8-25 LPA',
    demand: 'Very High',
    skills: [
      { name: 'JavaScript', category: 'Languages', requiredLevel: 90, currentLevel: 65 },
      { name: 'TypeScript', category: 'Languages', requiredLevel: 80, currentLevel: 45 },
      { name: 'Python', category: 'Languages', requiredLevel: 50, currentLevel: 55 },
      { name: 'React', category: 'Frameworks', requiredLevel: 85, currentLevel: 50 },
      { name: 'Node.js', category: 'Frameworks', requiredLevel: 80, currentLevel: 40 },
      { name: 'SQL & Databases', category: 'Tools', requiredLevel: 75, currentLevel: 55 },
      { name: 'MongoDB', category: 'Tools', requiredLevel: 70, currentLevel: 35 },
      { name: 'Git & GitHub', category: 'Tools', requiredLevel: 85, currentLevel: 70 },
      { name: 'Docker', category: 'Tools', requiredLevel: 60, currentLevel: 20 },
      { name: 'REST API Design', category: 'Core', requiredLevel: 85, currentLevel: 50 },
      { name: 'Testing (Jest/Cypress)', category: 'Core', requiredLevel: 70, currentLevel: 25 },
      { name: 'System Design Basics', category: 'Soft Skills', requiredLevel: 65, currentLevel: 30 },
    ],
  },
  {
    id: 'datascientist',
    title: 'Data Scientist',
    icon: 'analytics',
    color: '#7C3AED',
    description: 'Extract insights from data using ML and statistical methods',
    avgSalary: '10-30 LPA',
    demand: 'Very High',
    skills: [
      { name: 'Python', category: 'Languages', requiredLevel: 90, currentLevel: 60 },
      { name: 'R Programming', category: 'Languages', requiredLevel: 55, currentLevel: 20 },
      { name: 'SQL', category: 'Languages', requiredLevel: 80, currentLevel: 55 },
      { name: 'Statistics & Probability', category: 'Core', requiredLevel: 90, currentLevel: 45 },
      { name: 'Machine Learning', category: 'Core', requiredLevel: 85, currentLevel: 35 },
      { name: 'Pandas & NumPy', category: 'Frameworks', requiredLevel: 85, currentLevel: 50 },
      { name: 'Data Visualization', category: 'Tools', requiredLevel: 80, currentLevel: 40 },
      { name: 'Deep Learning', category: 'Core', requiredLevel: 65, currentLevel: 20 },
      { name: 'NLP Fundamentals', category: 'Core', requiredLevel: 60, currentLevel: 15 },
      { name: 'Feature Engineering', category: 'Data', requiredLevel: 75, currentLevel: 30 },
      { name: 'A/B Testing', category: 'Core', requiredLevel: 70, currentLevel: 25 },
      { name: 'Storytelling with Data', category: 'Soft Skills', requiredLevel: 75, currentLevel: 40 },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    icon: 'settings_suggest',
    color: '#F59E0B',
    description: 'Automate infrastructure, CI/CD pipelines, and deployments',
    avgSalary: '10-28 LPA',
    demand: 'High',
    skills: [
      { name: 'Linux Administration', category: 'Core', requiredLevel: 90, currentLevel: 50 },
      { name: 'Shell Scripting', category: 'Languages', requiredLevel: 80, currentLevel: 40 },
      { name: 'Python', category: 'Languages', requiredLevel: 70, currentLevel: 55 },
      { name: 'Docker', category: 'Tools', requiredLevel: 90, currentLevel: 30 },
      { name: 'Kubernetes', category: 'Tools', requiredLevel: 85, currentLevel: 15 },
      { name: 'CI/CD (Jenkins/GitHub Actions)', category: 'Tools', requiredLevel: 85, currentLevel: 25 },
      { name: 'AWS / Cloud Platforms', category: 'Cloud', requiredLevel: 85, currentLevel: 35 },
      { name: 'Terraform / IaC', category: 'Tools', requiredLevel: 75, currentLevel: 10 },
      { name: 'Monitoring (Prometheus/Grafana)', category: 'Tools', requiredLevel: 70, currentLevel: 15 },
      { name: 'Networking Basics', category: 'Core', requiredLevel: 75, currentLevel: 45 },
      { name: 'Security Best Practices', category: 'Core', requiredLevel: 70, currentLevel: 30 },
      { name: 'Git & Version Control', category: 'Tools', requiredLevel: 85, currentLevel: 65 },
    ],
  },
  {
    id: 'productmanager',
    title: 'Product Manager',
    icon: 'category',
    color: '#10B981',
    description: 'Drive product vision, strategy, and cross-functional execution',
    avgSalary: '12-35 LPA',
    demand: 'High',
    skills: [
      { name: 'Product Strategy', category: 'Core', requiredLevel: 90, currentLevel: 35 },
      { name: 'User Research', category: 'Core', requiredLevel: 85, currentLevel: 30 },
      { name: 'Data Analysis', category: 'Data', requiredLevel: 80, currentLevel: 45 },
      { name: 'Agile & Scrum', category: 'Frameworks', requiredLevel: 85, currentLevel: 40 },
      { name: 'Wireframing & Prototyping', category: 'Design', requiredLevel: 65, currentLevel: 25 },
      { name: 'SQL Basics', category: 'Languages', requiredLevel: 60, currentLevel: 50 },
      { name: 'A/B Testing', category: 'Core', requiredLevel: 75, currentLevel: 20 },
      { name: 'Communication & Presentation', category: 'Soft Skills', requiredLevel: 90, currentLevel: 60 },
      { name: 'Stakeholder Management', category: 'Soft Skills', requiredLevel: 85, currentLevel: 45 },
      { name: 'Technical Understanding', category: 'Core', requiredLevel: 70, currentLevel: 50 },
      { name: 'Roadmap Planning', category: 'Core', requiredLevel: 80, currentLevel: 25 },
      { name: 'Metrics & KPIs', category: 'Data', requiredLevel: 85, currentLevel: 35 },
    ],
  },
  {
    id: 'uiux',
    title: 'UI/UX Designer',
    icon: 'palette',
    color: '#EC4899',
    description: 'Craft beautiful, user-centered digital product experiences',
    avgSalary: '6-22 LPA',
    demand: 'High',
    skills: [
      { name: 'Figma', category: 'Tools', requiredLevel: 90, currentLevel: 45 },
      { name: 'User Research', category: 'Core', requiredLevel: 85, currentLevel: 30 },
      { name: 'Wireframing', category: 'Core', requiredLevel: 85, currentLevel: 40 },
      { name: 'Prototyping', category: 'Core', requiredLevel: 80, currentLevel: 35 },
      { name: 'Visual Design', category: 'Design', requiredLevel: 90, currentLevel: 50 },
      { name: 'Interaction Design', category: 'Design', requiredLevel: 80, currentLevel: 25 },
      { name: 'Design Systems', category: 'Design', requiredLevel: 75, currentLevel: 20 },
      { name: 'Usability Testing', category: 'Core', requiredLevel: 80, currentLevel: 30 },
      { name: 'Typography & Color Theory', category: 'Design', requiredLevel: 85, currentLevel: 55 },
      { name: 'HTML & CSS', category: 'Languages', requiredLevel: 60, currentLevel: 40 },
      { name: 'Design Thinking', category: 'Soft Skills', requiredLevel: 80, currentLevel: 35 },
      { name: 'Accessibility (a11y)', category: 'Core', requiredLevel: 70, currentLevel: 20 },
    ],
  },
  {
    id: 'mobile',
    title: 'Mobile Developer',
    icon: 'smartphone',
    color: '#22D3EE',
    description: 'Build native and cross-platform mobile applications',
    avgSalary: '8-24 LPA',
    demand: 'High',
    skills: [
      { name: 'React Native / Flutter', category: 'Frameworks', requiredLevel: 85, currentLevel: 30 },
      { name: 'JavaScript / Dart', category: 'Languages', requiredLevel: 85, currentLevel: 55 },
      { name: 'iOS & Android Basics', category: 'Core', requiredLevel: 70, currentLevel: 25 },
      { name: 'API Integration', category: 'Core', requiredLevel: 80, currentLevel: 45 },
      { name: 'State Management', category: 'Frameworks', requiredLevel: 80, currentLevel: 35 },
      { name: 'UI/UX Principles', category: 'Design', requiredLevel: 75, currentLevel: 40 },
      { name: 'Mobile Testing', category: 'Tools', requiredLevel: 70, currentLevel: 20 },
      { name: 'App Store Deployment', category: 'Tools', requiredLevel: 65, currentLevel: 10 },
      { name: 'Performance Optimization', category: 'Core', requiredLevel: 75, currentLevel: 25 },
      { name: 'Git & Version Control', category: 'Tools', requiredLevel: 80, currentLevel: 65 },
      { name: 'Firebase', category: 'Cloud', requiredLevel: 70, currentLevel: 30 },
      { name: 'Offline Storage & Caching', category: 'Core', requiredLevel: 65, currentLevel: 15 },
    ],
  },
  {
    id: 'cloudarchitect',
    title: 'Cloud Architect',
    icon: 'cloud',
    color: '#F97316',
    description: 'Design scalable, secure, and cost-effective cloud infrastructure',
    avgSalary: '18-45 LPA',
    demand: 'Very High',
    skills: [
      { name: 'AWS / Azure / GCP', category: 'Cloud', requiredLevel: 95, currentLevel: 35 },
      { name: 'Networking & VPC', category: 'Core', requiredLevel: 85, currentLevel: 40 },
      { name: 'Security & IAM', category: 'Core', requiredLevel: 90, currentLevel: 30 },
      { name: 'Microservices Architecture', category: 'Core', requiredLevel: 85, currentLevel: 25 },
      { name: 'Docker', category: 'Tools', requiredLevel: 80, currentLevel: 30 },
      { name: 'Kubernetes', category: 'Tools', requiredLevel: 80, currentLevel: 15 },
      { name: 'Terraform / IaC', category: 'Tools', requiredLevel: 85, currentLevel: 10 },
      { name: 'Database Design', category: 'Data', requiredLevel: 80, currentLevel: 50 },
      { name: 'Cost Optimization', category: 'Core', requiredLevel: 75, currentLevel: 20 },
      { name: 'Monitoring & Logging', category: 'Tools', requiredLevel: 75, currentLevel: 25 },
      { name: 'CI/CD Pipelines', category: 'Tools', requiredLevel: 75, currentLevel: 30 },
      { name: 'System Design', category: 'Core', requiredLevel: 90, currentLevel: 35 },
    ],
  },
  {
    id: 'mlengineer',
    title: 'ML Engineer',
    icon: 'psychology',
    color: '#A855F7',
    description: 'Build and deploy production-grade machine learning systems',
    avgSalary: '12-40 LPA',
    demand: 'Very High',
    skills: [
      { name: 'Python', category: 'Languages', requiredLevel: 92, currentLevel: 60 },
      { name: 'Machine Learning Algorithms', category: 'Core', requiredLevel: 90, currentLevel: 40 },
      { name: 'Deep Learning (CNNs, RNNs)', category: 'Core', requiredLevel: 85, currentLevel: 25 },
      { name: 'TensorFlow / PyTorch', category: 'Frameworks', requiredLevel: 85, currentLevel: 30 },
      { name: 'MLOps & Pipelines', category: 'Tools', requiredLevel: 80, currentLevel: 15 },
      { name: 'Data Engineering', category: 'Data', requiredLevel: 75, currentLevel: 35 },
      { name: 'Statistics & Math', category: 'Core', requiredLevel: 85, currentLevel: 50 },
      { name: 'Docker & Containers', category: 'Tools', requiredLevel: 70, currentLevel: 25 },
      { name: 'Cloud Services (AWS/GCP)', category: 'Cloud', requiredLevel: 75, currentLevel: 30 },
      { name: 'SQL & Data Querying', category: 'Languages', requiredLevel: 75, currentLevel: 50 },
      { name: 'Feature Engineering', category: 'Data', requiredLevel: 80, currentLevel: 30 },
      { name: 'Model Deployment & Serving', category: 'Core', requiredLevel: 80, currentLevel: 15 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Resource Pools (used to populate gap resources)                     */
/* ------------------------------------------------------------------ */

const resourcePool: Record<string, Resource[]> = {
  JavaScript: [
    { name: 'Namaste JavaScript', type: 'course', platform: 'YouTube', duration: '20 hrs' },
    { name: 'JavaScript: Understanding the Weird Parts', type: 'course', platform: 'Udemy', duration: '12 hrs' },
  ],
  TypeScript: [
    { name: 'TypeScript for Professionals', type: 'course', platform: 'Udemy', duration: '10 hrs' },
    { name: 'Total TypeScript', type: 'course', platform: 'Matt Pocock', duration: '15 hrs' },
  ],
  Python: [
    { name: 'Python for Everybody', type: 'course', platform: 'Coursera', duration: '40 hrs' },
    { name: 'Automate the Boring Stuff', type: 'book', platform: 'Online', duration: '25 hrs' },
  ],
  React: [
    { name: 'React - The Complete Guide', type: 'course', platform: 'Udemy', duration: '48 hrs' },
    { name: 'Build a project-based portfolio', type: 'project', platform: 'GitHub', duration: '30 hrs' },
  ],
  'Node.js': [
    { name: 'Node.js Backend Masterclass', type: 'course', platform: 'Udemy', duration: '36 hrs' },
    { name: 'Build a REST API from scratch', type: 'project', platform: 'GitHub', duration: '20 hrs' },
  ],
  'SQL & Databases': [
    { name: 'SQL for Data Science', type: 'course', platform: 'Coursera', duration: '15 hrs' },
    { name: 'Database Design & PostgreSQL', type: 'course', platform: 'Udemy', duration: '22 hrs' },
  ],
  MongoDB: [
    { name: 'MongoDB University M001', type: 'certification', platform: 'MongoDB', duration: '10 hrs' },
    { name: 'MERN Stack Full Course', type: 'course', platform: 'YouTube', duration: '16 hrs' },
  ],
  'Git & GitHub': [
    { name: 'Git & GitHub Crash Course', type: 'course', platform: 'YouTube', duration: '4 hrs' },
    { name: 'Contribute to open source', type: 'project', platform: 'GitHub', duration: '10 hrs' },
  ],
  Docker: [
    { name: 'Docker Mastery', type: 'course', platform: 'Udemy', duration: '20 hrs' },
    { name: 'Docker Certified Associate', type: 'certification', platform: 'Docker', duration: '40 hrs' },
  ],
  'REST API Design': [
    { name: 'REST API Design Best Practices', type: 'course', platform: 'Pluralsight', duration: '8 hrs' },
    { name: 'Build a production REST API', type: 'project', platform: 'GitHub', duration: '15 hrs' },
  ],
  'Testing (Jest/Cypress)': [
    { name: 'Testing JavaScript', type: 'course', platform: 'Kent C. Dodds', duration: '18 hrs' },
    { name: 'Cypress End-to-End Testing', type: 'course', platform: 'Udemy', duration: '12 hrs' },
  ],
  'System Design Basics': [
    { name: 'System Design Primer', type: 'book', platform: 'GitHub', duration: '30 hrs' },
    { name: 'Grokking System Design', type: 'course', platform: 'Educative', duration: '25 hrs' },
  ],
  'R Programming': [
    { name: 'R Programming Specialization', type: 'course', platform: 'Coursera', duration: '30 hrs' },
    { name: 'R for Data Science (book)', type: 'book', platform: 'Online', duration: '20 hrs' },
  ],
  SQL: [
    { name: 'Advanced SQL for Analytics', type: 'course', platform: 'DataCamp', duration: '12 hrs' },
    { name: 'SQL Practice on HackerRank', type: 'project', platform: 'HackerRank', duration: '15 hrs' },
  ],
  'Statistics & Probability': [
    { name: 'Statistics with Python', type: 'course', platform: 'Coursera', duration: '35 hrs' },
    { name: 'Think Stats (book)', type: 'book', platform: 'Online', duration: '20 hrs' },
  ],
  'Machine Learning': [
    { name: 'Machine Learning by Andrew Ng', type: 'course', platform: 'Coursera', duration: '60 hrs' },
    { name: 'Hands-On ML (Aurelien Geron)', type: 'book', platform: 'O\'Reilly', duration: '50 hrs' },
  ],
  'Pandas & NumPy': [
    { name: 'Data Analysis with Pandas', type: 'course', platform: 'DataCamp', duration: '15 hrs' },
    { name: 'NumPy & Pandas Practice', type: 'project', platform: 'Kaggle', duration: '12 hrs' },
  ],
  'Data Visualization': [
    { name: 'Data Visualization with Python', type: 'course', platform: 'Coursera', duration: '18 hrs' },
    { name: 'Tableau Expert Certification', type: 'certification', platform: 'Tableau', duration: '30 hrs' },
  ],
  'Deep Learning': [
    { name: 'Deep Learning Specialization', type: 'course', platform: 'Coursera', duration: '80 hrs' },
    { name: 'Fast.ai Practical DL', type: 'course', platform: 'fast.ai', duration: '40 hrs' },
  ],
  'NLP Fundamentals': [
    { name: 'NLP Specialization', type: 'course', platform: 'Coursera', duration: '45 hrs' },
    { name: 'Hugging Face NLP Course', type: 'course', platform: 'Hugging Face', duration: '20 hrs' },
  ],
  'Feature Engineering': [
    { name: 'Feature Engineering for ML', type: 'course', platform: 'Coursera', duration: '15 hrs' },
    { name: 'Kaggle Feature Engineering', type: 'project', platform: 'Kaggle', duration: '20 hrs' },
  ],
  'A/B Testing': [
    { name: 'A/B Testing by Google', type: 'course', platform: 'Udacity', duration: '20 hrs' },
    { name: 'Bayesian A/B Testing Guide', type: 'book', platform: 'Online', duration: '10 hrs' },
  ],
  'Storytelling with Data': [
    { name: 'Storytelling with Data (book)', type: 'book', platform: 'Knaflic', duration: '15 hrs' },
    { name: 'Business Communication Skills', type: 'course', platform: 'Coursera', duration: '12 hrs' },
  ],
  'Linux Administration': [
    { name: 'Linux Administration Bootcamp', type: 'course', platform: 'Udemy', duration: '30 hrs' },
    { name: 'RHCSA Certification Prep', type: 'certification', platform: 'Red Hat', duration: '50 hrs' },
  ],
  'Shell Scripting': [
    { name: 'Bash Scripting Full Course', type: 'course', platform: 'YouTube', duration: '8 hrs' },
    { name: 'Automate server tasks project', type: 'project', platform: 'GitHub', duration: '15 hrs' },
  ],
  Kubernetes: [
    { name: 'Kubernetes for Beginners', type: 'course', platform: 'KodeKloud', duration: '25 hrs' },
    { name: 'CKA Certification', type: 'certification', platform: 'Linux Foundation', duration: '60 hrs' },
  ],
  'CI/CD (Jenkins/GitHub Actions)': [
    { name: 'CI/CD with Jenkins', type: 'course', platform: 'Udemy', duration: '14 hrs' },
    { name: 'GitHub Actions Masterclass', type: 'course', platform: 'Udemy', duration: '10 hrs' },
  ],
  'AWS / Cloud Platforms': [
    { name: 'AWS Solutions Architect', type: 'certification', platform: 'AWS', duration: '80 hrs' },
    { name: 'Cloud Practitioner Essentials', type: 'course', platform: 'AWS', duration: '20 hrs' },
  ],
  'Terraform / IaC': [
    { name: 'Terraform Associate Certification', type: 'certification', platform: 'HashiCorp', duration: '40 hrs' },
    { name: 'IaC with Terraform on AWS', type: 'course', platform: 'Udemy', duration: '18 hrs' },
  ],
  'Monitoring (Prometheus/Grafana)': [
    { name: 'Prometheus & Grafana Masterclass', type: 'course', platform: 'Udemy', duration: '12 hrs' },
    { name: 'Setup monitoring for microservices', type: 'project', platform: 'GitHub', duration: '10 hrs' },
  ],
  'Networking Basics': [
    { name: 'Computer Networking Full Course', type: 'course', platform: 'YouTube', duration: '15 hrs' },
    { name: 'CompTIA Network+ Prep', type: 'certification', platform: 'CompTIA', duration: '40 hrs' },
  ],
  'Security Best Practices': [
    { name: 'DevSecOps Fundamentals', type: 'course', platform: 'Coursera', duration: '18 hrs' },
    { name: 'OWASP Top 10 Deep Dive', type: 'course', platform: 'Udemy', duration: '8 hrs' },
  ],
  'Git & Version Control': [
    { name: 'Git Complete Course', type: 'course', platform: 'Udemy', duration: '6 hrs' },
    { name: 'Open Source Contributions', type: 'project', platform: 'GitHub', duration: '15 hrs' },
  ],
  'Product Strategy': [
    { name: 'Product Management by Google', type: 'course', platform: 'Coursera', duration: '25 hrs' },
    { name: 'Inspired (Marty Cagan)', type: 'book', platform: 'SVPG', duration: '15 hrs' },
  ],
  'User Research': [
    { name: 'UX Research & Strategy', type: 'course', platform: 'Coursera', duration: '20 hrs' },
    { name: 'Conduct 5 user interviews', type: 'project', platform: 'Field', duration: '10 hrs' },
  ],
  'Data Analysis': [
    { name: 'Google Data Analytics', type: 'certification', platform: 'Coursera', duration: '40 hrs' },
    { name: 'Excel/Sheets for PM', type: 'course', platform: 'YouTube', duration: '8 hrs' },
  ],
  'Agile & Scrum': [
    { name: 'Scrum Master Certification', type: 'certification', platform: 'Scrum.org', duration: '30 hrs' },
    { name: 'Agile with Atlassian Jira', type: 'course', platform: 'Coursera', duration: '12 hrs' },
  ],
  'Wireframing & Prototyping': [
    { name: 'UI/UX Design with Figma', type: 'course', platform: 'Udemy', duration: '16 hrs' },
    { name: 'Design a complete app flow', type: 'project', platform: 'Figma', duration: '12 hrs' },
  ],
  'SQL Basics': [
    { name: 'SQL for Non-Developers', type: 'course', platform: 'DataCamp', duration: '8 hrs' },
    { name: 'Practice on SQLZoo', type: 'project', platform: 'SQLZoo', duration: '6 hrs' },
  ],
  'Communication & Presentation': [
    { name: 'High-Impact Presentations', type: 'course', platform: 'Coursera', duration: '12 hrs' },
    { name: 'Toastmasters practice', type: 'project', platform: 'Toastmasters', duration: '20 hrs' },
  ],
  'Stakeholder Management': [
    { name: 'Negotiation & Influence', type: 'course', platform: 'Coursera', duration: '15 hrs' },
    { name: 'Product Leadership Course', type: 'course', platform: 'Reforge', duration: '10 hrs' },
  ],
  'Technical Understanding': [
    { name: 'CS50 Introduction to CS', type: 'course', platform: 'Harvard/edX', duration: '30 hrs' },
    { name: 'API & System Architecture Basics', type: 'course', platform: 'YouTube', duration: '8 hrs' },
  ],
  'Roadmap Planning': [
    { name: 'Product Roadmapping', type: 'course', platform: 'Productboard', duration: '8 hrs' },
    { name: 'Build a sample product roadmap', type: 'project', platform: 'Notion', duration: '6 hrs' },
  ],
  'Metrics & KPIs': [
    { name: 'Product Analytics Micro-Cert', type: 'certification', platform: 'CXL', duration: '20 hrs' },
    { name: 'Lean Analytics (book)', type: 'book', platform: 'O\'Reilly', duration: '12 hrs' },
  ],
  Figma: [
    { name: 'Figma UI Design Tutorial', type: 'course', platform: 'YouTube', duration: '10 hrs' },
    { name: 'Figma Advanced Prototyping', type: 'course', platform: 'Udemy', duration: '14 hrs' },
  ],
  Wireframing: [
    { name: 'Wireframing with Figma', type: 'course', platform: 'Skillshare', duration: '6 hrs' },
    { name: 'Wireframe 5 real app flows', type: 'project', platform: 'Figma', duration: '10 hrs' },
  ],
  Prototyping: [
    { name: 'Interactive Prototyping', type: 'course', platform: 'Udemy', duration: '12 hrs' },
    { name: 'Prototype a mobile app E2E', type: 'project', platform: 'Figma', duration: '8 hrs' },
  ],
  'Visual Design': [
    { name: 'Visual Design Fundamentals', type: 'course', platform: 'Coursera', duration: '20 hrs' },
    { name: 'Redesign 3 popular apps', type: 'project', platform: 'Dribbble', duration: '15 hrs' },
  ],
  'Interaction Design': [
    { name: 'Interaction Design Specialization', type: 'course', platform: 'Coursera', duration: '25 hrs' },
    { name: 'Micro-interaction animations', type: 'project', platform: 'After Effects', duration: '10 hrs' },
  ],
  'Design Systems': [
    { name: 'Building Design Systems', type: 'course', platform: 'Pluralsight', duration: '15 hrs' },
    { name: 'Create a Figma component library', type: 'project', platform: 'Figma', duration: '20 hrs' },
  ],
  'Usability Testing': [
    { name: 'UX Research Methods', type: 'course', platform: 'NNGroup', duration: '12 hrs' },
    { name: 'Run 3 usability test sessions', type: 'project', platform: 'Maze', duration: '8 hrs' },
  ],
  'Typography & Color Theory': [
    { name: 'Typography Fundamentals', type: 'course', platform: 'Skillshare', duration: '8 hrs' },
    { name: 'Color for UI Design', type: 'course', platform: 'YouTube', duration: '4 hrs' },
  ],
  'HTML & CSS': [
    { name: 'HTML & CSS for Designers', type: 'course', platform: 'Codecademy', duration: '15 hrs' },
    { name: 'Build a responsive portfolio', type: 'project', platform: 'GitHub', duration: '10 hrs' },
  ],
  'Design Thinking': [
    { name: 'Design Thinking by IDEO', type: 'course', platform: 'IDEO U', duration: '12 hrs' },
    { name: 'Design sprint workshop', type: 'project', platform: 'GV', duration: '8 hrs' },
  ],
  'Accessibility (a11y)': [
    { name: 'Web Accessibility by W3C', type: 'course', platform: 'edX', duration: '15 hrs' },
    { name: 'IAAP CPACC Certification', type: 'certification', platform: 'IAAP', duration: '30 hrs' },
  ],
  'React Native / Flutter': [
    { name: 'React Native Complete Guide', type: 'course', platform: 'Udemy', duration: '40 hrs' },
    { name: 'Flutter & Dart Full Course', type: 'course', platform: 'Udemy', duration: '42 hrs' },
  ],
  'JavaScript / Dart': [
    { name: 'Dart Programming Tutorial', type: 'course', platform: 'YouTube', duration: '8 hrs' },
    { name: 'Advanced JavaScript Patterns', type: 'course', platform: 'Frontend Masters', duration: '12 hrs' },
  ],
  'iOS & Android Basics': [
    { name: 'Mobile App Dev Fundamentals', type: 'course', platform: 'Coursera', duration: '20 hrs' },
    { name: 'Build a native platform feature', type: 'project', platform: 'Xcode/Android Studio', duration: '15 hrs' },
  ],
  'API Integration': [
    { name: 'REST & GraphQL for Mobile', type: 'course', platform: 'Udemy', duration: '10 hrs' },
    { name: 'Build an app with REST + Auth', type: 'project', platform: 'GitHub', duration: '12 hrs' },
  ],
  'State Management': [
    { name: 'State Management Deep Dive', type: 'course', platform: 'Udemy', duration: '10 hrs' },
    { name: 'Redux / Riverpod patterns project', type: 'project', platform: 'GitHub', duration: '8 hrs' },
  ],
  'UI/UX Principles': [
    { name: 'Mobile UI/UX Best Practices', type: 'course', platform: 'Coursera', duration: '12 hrs' },
    { name: 'Redesign a popular app\'s UX', type: 'project', platform: 'Figma', duration: '8 hrs' },
  ],
  'Mobile Testing': [
    { name: 'Mobile App Testing Complete', type: 'course', platform: 'Udemy', duration: '10 hrs' },
    { name: 'Write tests for a Flutter app', type: 'project', platform: 'GitHub', duration: '8 hrs' },
  ],
  'App Store Deployment': [
    { name: 'App Store & Play Store Guide', type: 'course', platform: 'YouTube', duration: '4 hrs' },
    { name: 'Deploy your first mobile app', type: 'project', platform: 'App Store', duration: '6 hrs' },
  ],
  'Performance Optimization': [
    { name: 'Mobile Performance Optimization', type: 'course', platform: 'Udemy', duration: '8 hrs' },
    { name: 'Profile & optimize a real app', type: 'project', platform: 'GitHub', duration: '10 hrs' },
  ],
  Firebase: [
    { name: 'Firebase Complete Guide', type: 'course', platform: 'Udemy', duration: '14 hrs' },
    { name: 'Build a real-time chat app', type: 'project', platform: 'Firebase', duration: '12 hrs' },
  ],
  'Offline Storage & Caching': [
    { name: 'Local DB & Caching Strategies', type: 'course', platform: 'YouTube', duration: '6 hrs' },
    { name: 'Implement offline-first app', type: 'project', platform: 'GitHub', duration: '10 hrs' },
  ],
  'AWS / Azure / GCP': [
    { name: 'AWS Solutions Architect', type: 'certification', platform: 'AWS', duration: '80 hrs' },
    { name: 'Multi-cloud architecture project', type: 'project', platform: 'GitHub', duration: '30 hrs' },
  ],
  'Networking & VPC': [
    { name: 'AWS Networking Specialty', type: 'certification', platform: 'AWS', duration: '50 hrs' },
    { name: 'Design a VPC from scratch', type: 'project', platform: 'AWS', duration: '10 hrs' },
  ],
  'Security & IAM': [
    { name: 'AWS Security Specialty', type: 'certification', platform: 'AWS', duration: '60 hrs' },
    { name: 'Cloud Security Fundamentals', type: 'course', platform: 'Coursera', duration: '25 hrs' },
  ],
  'Microservices Architecture': [
    { name: 'Microservices with Node & React', type: 'course', platform: 'Udemy', duration: '54 hrs' },
    { name: 'Building Microservices (book)', type: 'book', platform: 'O\'Reilly', duration: '20 hrs' },
  ],
  'Database Design': [
    { name: 'Database Design & Modeling', type: 'course', platform: 'Udemy', duration: '18 hrs' },
    { name: 'Design schemas for 3 use cases', type: 'project', platform: 'GitHub', duration: '10 hrs' },
  ],
  'Cost Optimization': [
    { name: 'AWS Cost Optimization Guide', type: 'course', platform: 'AWS', duration: '10 hrs' },
    { name: 'FinOps Certification', type: 'certification', platform: 'FinOps Foundation', duration: '25 hrs' },
  ],
  'Monitoring & Logging': [
    { name: 'Cloud Monitoring & Observability', type: 'course', platform: 'Udemy', duration: '12 hrs' },
    { name: 'Setup ELK stack project', type: 'project', platform: 'GitHub', duration: '10 hrs' },
  ],
  'CI/CD Pipelines': [
    { name: 'CI/CD for Cloud Architecture', type: 'course', platform: 'Udemy', duration: '14 hrs' },
    { name: 'Multi-env pipeline project', type: 'project', platform: 'GitHub Actions', duration: '10 hrs' },
  ],
  'System Design': [
    { name: 'System Design Interview Course', type: 'course', platform: 'Educative', duration: '40 hrs' },
    { name: 'Designing Data-Intensive Apps', type: 'book', platform: 'O\'Reilly', duration: '35 hrs' },
  ],
  'Machine Learning Algorithms': [
    { name: 'ML Specialization (Stanford)', type: 'course', platform: 'Coursera', duration: '60 hrs' },
    { name: 'Implement 10 ML algos from scratch', type: 'project', platform: 'GitHub', duration: '40 hrs' },
  ],
  'Deep Learning (CNNs, RNNs)': [
    { name: 'Deep Learning Specialization', type: 'course', platform: 'Coursera', duration: '80 hrs' },
    { name: 'Build an image classifier (CNN)', type: 'project', platform: 'Kaggle', duration: '20 hrs' },
  ],
  'TensorFlow / PyTorch': [
    { name: 'TensorFlow Developer Certificate', type: 'certification', platform: 'Google', duration: '60 hrs' },
    { name: 'PyTorch for Deep Learning', type: 'course', platform: 'fast.ai', duration: '40 hrs' },
  ],
  'MLOps & Pipelines': [
    { name: 'MLOps Specialization', type: 'course', platform: 'Coursera', duration: '45 hrs' },
    { name: 'Build an ML pipeline with MLflow', type: 'project', platform: 'GitHub', duration: '20 hrs' },
  ],
  'Data Engineering': [
    { name: 'Data Engineering on GCP', type: 'certification', platform: 'Google', duration: '50 hrs' },
    { name: 'Build an ETL pipeline', type: 'project', platform: 'Airflow', duration: '20 hrs' },
  ],
  'Statistics & Math': [
    { name: 'Mathematics for ML', type: 'course', platform: 'Coursera', duration: '40 hrs' },
    { name: 'Linear Algebra (3Blue1Brown)', type: 'course', platform: 'YouTube', duration: '15 hrs' },
  ],
  'Docker & Containers': [
    { name: 'Docker for Data Scientists', type: 'course', platform: 'Udemy', duration: '12 hrs' },
    { name: 'Containerize an ML model', type: 'project', platform: 'Docker Hub', duration: '8 hrs' },
  ],
  'Cloud Services (AWS/GCP)': [
    { name: 'AWS ML Specialty Certification', type: 'certification', platform: 'AWS', duration: '60 hrs' },
    { name: 'Deploy models on SageMaker', type: 'project', platform: 'AWS', duration: '15 hrs' },
  ],
  'SQL & Data Querying': [
    { name: 'Advanced SQL for Analytics', type: 'course', platform: 'DataCamp', duration: '15 hrs' },
    { name: 'BigQuery & Spark SQL Practice', type: 'project', platform: 'Google Cloud', duration: '10 hrs' },
  ],
  'Model Deployment & Serving': [
    { name: 'ML Model Deployment (FastAPI)', type: 'course', platform: 'Udemy', duration: '12 hrs' },
    { name: 'Deploy a model as REST API', type: 'project', platform: 'GitHub', duration: '10 hrs' },
  ],
};

/* ------------------------------------------------------------------ */
/*  Helper: get resources for a skill                                  */
/* ------------------------------------------------------------------ */

const getResourcesForSkill = (skillName: string): Resource[] => {
  return resourcePool[skillName] || [
    { name: `${skillName} Complete Course`, type: 'course', platform: 'Udemy', duration: '20 hrs' },
    { name: `${skillName} Hands-on Project`, type: 'project', platform: 'GitHub', duration: '15 hrs' },
  ];
};

/* ------------------------------------------------------------------ */
/*  Helper: compute gap analysis                                       */
/* ------------------------------------------------------------------ */

const computeGapAnalysis = (skills: Skill[]): SkillGap[] => {
  return skills
    .map((skill) => {
      const gap = Math.max(0, skill.requiredLevel - skill.currentLevel);
      const gapPercent = skill.requiredLevel > 0 ? Math.round((gap / skill.requiredLevel) * 100) : 0;
      const priority: 'critical' | 'important' | 'nice-to-have' =
        gapPercent >= 50 ? 'critical' : gapPercent >= 25 ? 'important' : 'nice-to-have';
      const estimatedHours = Math.round(gap * 1.2);
      return {
        skill,
        gap,
        gapPercent,
        priority,
        estimatedHours,
        resources: getResourcesForSkill(skill.name),
      };
    })
    .sort((a, b) => b.gap - a.gap);
};

/* ------------------------------------------------------------------ */
/*  Helper: get color for gap level                                    */
/* ------------------------------------------------------------------ */

const getGapColor = (current: number, required: number): string => {
  if (current >= required) return '#10B981';
  const ratio = current / required;
  if (ratio >= 0.75) return '#F59E0B';
  return '#EF4444';
};

const getGapLabel = (current: number, required: number): string => {
  if (current >= required) return 'Met';
  const ratio = current / required;
  if (ratio >= 0.75) return 'Close';
  return 'Gap';
};

/* ------------------------------------------------------------------ */
/*  Sub-component: Role Selection Card                                 */
/* ------------------------------------------------------------------ */

const RoleCard = ({
  role,
  isSelected,
  onSelect,
}: {
  role: RoleDefinition;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <motion.div variants={item}>
    <Card
      hover
      glass={isSelected}
      glow={isSelected}
      depth={isSelected ? 'floating' : 'raised'}
      onClick={onSelect}
      className={`relative transition-all duration-300 ${
        isSelected ? 'ring-2' : ''
      }`}
      padding="p-4"
    >
      {isSelected && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 2px ${role.color}60, 0 0 30px ${role.color}15`,
          }}
        />
      )}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${role.color}15`,
            border: `1px solid ${role.color}25`,
          }}
        >
          <Icon name={role.icon} size={22} style={{ color: role.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white leading-tight">{role.title}</h3>
          <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed line-clamp-2">
            {role.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={role.demand === 'Very High' ? 'success' : 'accent'} size="sm">
              {role.demand} Demand
            </Badge>
            <span className="text-[10px] text-[#64748B]">{role.avgSalary}</span>
          </div>
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: role.color }}
          >
            <Icon name="check" size={14} className="text-white" />
          </motion.div>
        )}
      </div>
    </Card>
  </motion.div>
);

/* ------------------------------------------------------------------ */
/*  Sub-component: Skill Slider Control                                */
/* ------------------------------------------------------------------ */

const SkillSlider = ({
  skill,
  onChange,
  accentColor,
}: {
  skill: Skill;
  onChange: (value: number) => void;
  accentColor: string;
}) => {
  const gapColor = getGapColor(skill.currentLevel, skill.requiredLevel);
  const met = skill.currentLevel >= skill.requiredLevel;

  return (
    <div className="flex items-center gap-4 py-2.5">
      <div className="w-44 flex-shrink-0">
        <p className="text-sm text-white font-medium truncate">{skill.name}</p>
        <p className="text-[10px] text-[#64748B]">{skill.category}</p>
      </div>
      <div className="flex-1 relative">
        <div className="w-full h-2 rounded-full bg-white/[0.04] relative overflow-hidden">
          {/* Required level marker */}
          <div
            className="absolute top-0 h-full rounded-full opacity-20"
            style={{
              width: `${skill.requiredLevel}%`,
              background: accentColor,
            }}
          />
          {/* Current level bar */}
          <motion.div
            className="absolute top-0 h-full rounded-full"
            style={{ background: gapColor }}
            initial={{ width: 0 }}
            animate={{ width: `${skill.currentLevel}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={skill.currentLevel}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ margin: 0, padding: 0 }}
        />
        {/* Required level indicator line */}
        <div
          className="absolute top-0 h-2 w-0.5 rounded-full"
          style={{
            left: `${skill.requiredLevel}%`,
            background: 'rgba(255,255,255,0.4)',
          }}
        />
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 w-28 justify-end">
        <span className="text-xs font-bold" style={{ color: gapColor }}>
          {skill.currentLevel}
        </span>
        <span className="text-[10px] text-[#64748B]">/</span>
        <span className="text-xs text-[#94A3B8]">{skill.requiredLevel}</span>
        {met ? (
          <Icon name="check_circle" size={14} style={{ color: '#10B981' }} filled />
        ) : (
          <Badge
            variant={
              skill.currentLevel / skill.requiredLevel >= 0.75
                ? 'warning'
                : 'error'
            }
            size="sm"
          >
            {getGapLabel(skill.currentLevel, skill.requiredLevel)}
          </Badge>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Sub-component: SVG Comparison Chart                                */
/* ------------------------------------------------------------------ */

const ComparisonChart = ({
  skills,
  accentColor,
}: {
  skills: Skill[];
  accentColor: string;
}) => {
  const barHeight = 28;
  const barGap = 10;
  const labelWidth = 150;
  const chartWidth = 600;
  const rightLabelWidth = 60;
  const totalWidth = labelWidth + chartWidth + rightLabelWidth;
  const totalHeight = skills.length * (barHeight + barGap) + 20;

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <svg
        width="100%"
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="min-w-[700px]"
      >
        <defs>
          <linearGradient id="currentBarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="metGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="closeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="gapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.6" />
          </linearGradient>
          <filter id="barGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {skills.map((skill, index) => {
          const y = index * (barHeight + barGap) + 10;
          const requiredWidth = (skill.requiredLevel / 100) * chartWidth;
          const currentWidth = (skill.currentLevel / 100) * chartWidth;
          const met = skill.currentLevel >= skill.requiredLevel;
          const ratio = skill.requiredLevel > 0 ? skill.currentLevel / skill.requiredLevel : 1;
          const fillId = met ? 'url(#metGradient)' : ratio >= 0.75 ? 'url(#closeGradient)' : 'url(#gapGradient)';
          const gapPercent = skill.requiredLevel > 0
            ? Math.round(((skill.requiredLevel - skill.currentLevel) / skill.requiredLevel) * 100)
            : 0;

          return (
            <g key={skill.name}>
              {/* Skill label */}
              <text
                x={labelWidth - 12}
                y={y + barHeight / 2 + 1}
                textAnchor="end"
                fill="#CBD5E1"
                fontSize="11"
                fontWeight="500"
                fontFamily="inherit"
              >
                {skill.name.length > 20 ? skill.name.substring(0, 18) + '...' : skill.name}
              </text>

              {/* Required level bar (background) */}
              <rect
                x={labelWidth}
                y={y}
                width={requiredWidth}
                height={barHeight}
                rx={6}
                fill="rgba(255,255,255,0.04)"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />

              {/* Required level dashed outline */}
              <rect
                x={labelWidth}
                y={y}
                width={requiredWidth}
                height={barHeight}
                rx={6}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
                strokeDasharray="4 3"
              />

              {/* Current level bar (animated via CSS) */}
              <rect
                x={labelWidth}
                y={y + 3}
                width={currentWidth}
                height={barHeight - 6}
                rx={4}
                fill={fillId}
                filter="url(#barGlow)"
                className="transition-all duration-700 ease-out"
              >
                <animate
                  attributeName="width"
                  from="0"
                  to={currentWidth}
                  dur="0.8s"
                  fill="freeze"
                  begin="0.3s"
                />
              </rect>

              {/* Required level marker line */}
              <line
                x1={labelWidth + requiredWidth}
                y1={y - 2}
                x2={labelWidth + requiredWidth}
                y2={y + barHeight + 2}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />

              {/* Gap or Met label */}
              <text
                x={labelWidth + chartWidth + 10}
                y={y + barHeight / 2 + 1}
                textAnchor="start"
                fill={met ? '#10B981' : ratio >= 0.75 ? '#F59E0B' : '#EF4444'}
                fontSize="11"
                fontWeight="700"
                fontFamily="inherit"
                dominantBaseline="middle"
              >
                {met ? 'MET' : `-${Math.max(0, gapPercent)}%`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Sub-component: Learning Path Item                                  */
/* ------------------------------------------------------------------ */

const LearningPathItem = ({
  gap,
  index,
  accentColor,
}: {
  gap: SkillGap;
  index: number;
  accentColor: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const priorityConfig = {
    critical: { color: '#EF4444', bg: 'bg-error/10', border: 'border-error/20', label: 'Critical' },
    important: { color: '#F59E0B', bg: 'bg-warning/10', border: 'border-warning/20', label: 'Important' },
    'nice-to-have': { color: '#10B981', bg: 'bg-success/10', border: 'border-success/20', label: 'Nice to Have' },
  };
  const config = priorityConfig[gap.priority];
  const resourceTypeIcons: Record<string, string> = {
    course: 'school',
    certification: 'verified',
    project: 'code',
    book: 'menu_book',
  };

  if (gap.gap <= 0) return null;

  return (
    <motion.div
      variants={item}
      custom={index}
      className="group"
    >
      <div
        className="rounded-xl border border-white/[0.06] overflow-hidden transition-all duration-300 hover:border-white/[0.1]"
        style={{
          background: 'linear-gradient(145deg, rgba(17,24,39,0.4), rgba(15,23,42,0.3))',
        }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-4 p-4 text-left"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{
              background: `${config.color}15`,
              color: config.color,
              border: `1px solid ${config.color}25`,
            }}
          >
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white truncate">{gap.skill.name}</p>
              <Badge
                variant={
                  gap.priority === 'critical'
                    ? 'error'
                    : gap.priority === 'important'
                    ? 'warning'
                    : 'success'
                }
                size="sm"
              >
                {config.label}
              </Badge>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Gap: {gap.gap} points &middot; ~{gap.estimatedHours} hours to close
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <ProgressBar
              value={gap.skill.currentLevel}
              max={gap.skill.requiredLevel}
              color={
                gap.priority === 'critical'
                  ? 'error'
                  : gap.priority === 'important'
                  ? 'warning'
                  : 'success'
              }
              size="sm"
              className="w-20"
            />
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon name="expand_more" size={20} className="text-[#64748B]" />
            </motion.div>
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-0">
                <div className="border-t border-white/[0.06] pt-3 space-y-2.5">
                  <p className="text-xs text-[#94A3B8] font-medium mb-2">
                    Recommended Resources
                  </p>
                  {gap.resources.map((resource, ri) => (
                    <div
                      key={ri}
                      className="flex items-center gap-3 p-2.5 rounded-lg transition-colors duration-200 hover:bg-white/[0.03]"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${accentColor}10`,
                          border: `1px solid ${accentColor}18`,
                        }}
                      >
                        <Icon
                          name={resourceTypeIcons[resource.type] || 'link'}
                          size={16}
                          style={{ color: accentColor }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{resource.name}</p>
                        <p className="text-[10px] text-[#64748B]">
                          {resource.platform} &middot; {resource.duration}
                        </p>
                      </div>
                      <Badge
                        variant={
                          resource.type === 'certification'
                            ? 'violet'
                            : resource.type === 'project'
                            ? 'accent'
                            : 'default'
                        }
                        size="sm"
                      >
                        {resource.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Sub-component: Role Comparison Mode                                */
/* ------------------------------------------------------------------ */

const RoleComparison = ({
  roleA,
  roleB,
  skillsA,
  skillsB,
}: {
  roleA: RoleDefinition;
  roleB: RoleDefinition;
  skillsA: Skill[];
  skillsB: Skill[];
}) => {
  const skillNamesA = new Set(skillsA.map((s) => s.name));
  const skillNamesB = new Set(skillsB.map((s) => s.name));
  const sharedSkills = skillsA.filter((s) => skillNamesB.has(s.name));
  const uniqueToA = skillsA.filter((s) => !skillNamesB.has(s.name));
  const uniqueToB = skillsB.filter((s) => !skillNamesA.has(s.name));

  const matchA = Math.round(
    (skillsA.reduce((sum, s) => sum + Math.min(s.currentLevel / s.requiredLevel, 1), 0) /
      skillsA.length) *
      100
  );
  const matchB = Math.round(
    (skillsB.reduce((sum, s) => sum + Math.min(s.currentLevel / s.requiredLevel, 1), 0) /
      skillsB.length) *
      100
  );

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-5">
      {/* Match percentages */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={item}>
          <Card glass padding="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${roleA.color}15`, border: `1px solid ${roleA.color}25` }}
              >
                <Icon name={roleA.icon} size={20} style={{ color: roleA.color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{roleA.title}</p>
                <p className="text-xs text-[#64748B]">Your match</p>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-2">{matchA}%</div>
            <ProgressBar value={matchA} color={matchA >= 70 ? 'success' : matchA >= 45 ? 'warning' : 'error'} size="md" />
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card glass padding="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${roleB.color}15`, border: `1px solid ${roleB.color}25` }}
              >
                <Icon name={roleB.icon} size={20} style={{ color: roleB.color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{roleB.title}</p>
                <p className="text-xs text-[#64748B]">Your match</p>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-2">{matchB}%</div>
            <ProgressBar value={matchB} color={matchB >= 70 ? 'success' : matchB >= 45 ? 'warning' : 'error'} size="md" />
          </Card>
        </motion.div>
      </div>

      {/* Shared skills */}
      <motion.div variants={item}>
        <Card glass padding="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="join" size={18} className="text-[#7C3AED]" />
            <h4 className="text-sm font-bold text-white">
              Shared Skills ({sharedSkills.length})
            </h4>
            <span className="text-xs text-[#64748B]">
              Skills that transfer between both roles
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sharedSkills.map((skill) => (
              <Badge key={skill.name} variant="violet" size="sm" dot>
                {skill.name}
              </Badge>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Unique skills comparison */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={item}>
          <Card glass padding="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: roleA.color }} />
              <h4 className="text-sm font-bold text-white">
                Unique to {roleA.title}
              </h4>
            </div>
            <div className="space-y-2">
              {uniqueToA.length > 0 ? (
                uniqueToA.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between">
                    <span className="text-xs text-[#CBD5E1]">{skill.name}</span>
                    <span className="text-[10px] text-[#64748B]">
                      Req: {skill.requiredLevel}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#64748B] italic">
                  All skills overlap with the other role
                </p>
              )}
            </div>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card glass padding="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: roleB.color }} />
              <h4 className="text-sm font-bold text-white">
                Unique to {roleB.title}
              </h4>
            </div>
            <div className="space-y-2">
              {uniqueToB.length > 0 ? (
                uniqueToB.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between">
                    <span className="text-xs text-[#CBD5E1]">{skill.name}</span>
                    <span className="text-[10px] text-[#64748B]">
                      Req: {skill.requiredLevel}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#64748B] italic">
                  All skills overlap with the other role
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Loading Spinner                                                    */
/* ------------------------------------------------------------------ */

const AnalysisLoader = () => (
  <motion.div
    className="flex flex-col items-center justify-center py-20 gap-5"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="relative w-16 h-16">
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{ borderTopColor: '#0066FF', borderRightColor: '#7C3AED' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-2 rounded-full border-2 border-transparent"
        style={{ borderBottomColor: '#22D3EE', borderLeftColor: '#10B981' }}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
      <div className="absolute inset-4 rounded-full bg-[#0F172A] flex items-center justify-center">
        <Icon name="psychology" size={20} className="text-[#0066FF]" />
      </div>
    </div>
    <div className="text-center">
      <motion.p
        className="text-sm font-medium text-white mb-1"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Analyzing your skill gaps...
      </motion.p>
      <p className="text-xs text-[#64748B]">
        Comparing your profile against role requirements
      </p>
    </div>
  </motion.div>
);

/* ------------------------------------------------------------------ */
/*  Main Component: SkillSimulator                                     */
/* ------------------------------------------------------------------ */

const SkillSimulator = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [compareRoleId, setCompareRoleId] = useState<string | null>(null);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [compareSkills, setCompareSkills] = useState<Skill[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [activeSection, setActiveSection] = useState<'assessment' | 'chart' | 'learning' | 'compare'>('assessment');

  /* ---- Derived state ---- */
  const selectedRole = useMemo(
    () => roleDefinitions.find((r) => r.id === selectedRoleId) || null,
    [selectedRoleId]
  );
  const compareRole = useMemo(
    () => roleDefinitions.find((r) => r.id === compareRoleId) || null,
    [compareRoleId]
  );

  const gapAnalysis = useMemo(() => computeGapAnalysis(skills), [skills]);

  const summaryStats = useMemo(() => {
    if (skills.length === 0) return { readiness: 0, skillsMet: 0, totalSkills: 0, estimatedWeeks: 0, topPriority: [] as string[] };
    const metCount = skills.filter((s) => s.currentLevel >= s.requiredLevel).length;
    const readiness = Math.round(
      (skills.reduce((sum, s) => sum + Math.min(s.currentLevel / s.requiredLevel, 1), 0) /
        skills.length) *
        100
    );
    const totalHours = gapAnalysis.reduce((sum, g) => sum + g.estimatedHours, 0);
    const estimatedWeeks = Math.ceil(totalHours / 15);
    const topPriority = gapAnalysis
      .filter((g) => g.gap > 0)
      .slice(0, 3)
      .map((g) => g.skill.name);
    return { readiness, skillsMet: metCount, totalSkills: skills.length, estimatedWeeks, topPriority };
  }, [skills, gapAnalysis]);

  /* ---- Handlers ---- */
  const handleRoleSelect = useCallback(
    (roleId: string) => {
      if (showComparison && selectedRoleId && roleId !== selectedRoleId) {
        setCompareRoleId(roleId);
        const compareRoleDef = roleDefinitions.find((r) => r.id === roleId);
        if (compareRoleDef) {
          setCompareSkills(compareRoleDef.skills.map((s) => ({
            ...s,
            currentLevel: skills.find((sk) => sk.name === s.name)?.currentLevel ?? s.currentLevel,
          })));
        }
        return;
      }

      setSelectedRoleId(roleId);
      setCompareRoleId(null);
      setShowComparison(false);
      setAnalysisReady(false);
      setIsAnalyzing(true);
      setActiveSection('assessment');

      const roleDef = roleDefinitions.find((r) => r.id === roleId);
      if (roleDef) {
        // Try real AI analysis, fall back to local data
        featuresAPI.analyzeSkillGap({ targetRole: roleDef.title }).then(res => {
          if (res.data?.data?.skills?.length) {
            const aiSkills = res.data.data.skills.map((s: any) => ({
              name: s.name,
              category: s.category || 'Core',
              requiredLevel: s.requiredLevel,
              currentLevel: s.currentLevel,
            }));
            setSkills(aiSkills);
          } else {
            setSkills(roleDef.skills.map((s) => ({ ...s })));
          }
          setIsAnalyzing(false);
          setAnalysisReady(true);
        }).catch(() => {
          // Fallback to local mock data
          setSkills(roleDef.skills.map((s) => ({ ...s })));
          setIsAnalyzing(false);
          setAnalysisReady(true);
        });
      }
    },
    [showComparison, selectedRoleId, skills]
  );

  const handleCustomRoleSubmit = useCallback(() => {
    if (!customRoleInput.trim()) return;
    const matchedRole = roleDefinitions.find(
      (r) => r.title.toLowerCase().includes(customRoleInput.toLowerCase())
    );
    if (matchedRole) {
      handleRoleSelect(matchedRole.id);
      setCustomRoleInput('');
    } else {
      handleRoleSelect('fullstack');
      setCustomRoleInput('');
    }
  }, [customRoleInput, handleRoleSelect]);

  const handleSkillChange = useCallback((skillName: string, value: number) => {
    setSkills((prev) =>
      prev.map((s) => (s.name === skillName ? { ...s, currentLevel: value } : s))
    );
  }, []);

  const handleCompareToggle = useCallback(() => {
    if (showComparison) {
      setShowComparison(false);
      setCompareRoleId(null);
      setCompareSkills([]);
    } else {
      setShowComparison(true);
    }
  }, [showComparison]);

  /* ---- Group skills by category ---- */
  const groupedSkills = useMemo(() => {
    const groups: Record<string, Skill[]> = {};
    skills.forEach((skill) => {
      if (!groups[skill.category]) groups[skill.category] = [];
      groups[skill.category].push(skill);
    });
    return groups;
  }, [skills]);

  const categoryIcons: Record<string, string> = {
    Languages: 'code',
    Frameworks: 'widgets',
    Tools: 'handyman',
    'Soft Skills': 'groups',
    Core: 'hub',
    Data: 'database',
    Cloud: 'cloud',
    Design: 'palette',
  };

  /* ---- Sections nav ---- */
  const sections = [
    { id: 'assessment' as const, label: 'Assessment', icon: 'tune' },
    { id: 'chart' as const, label: 'Gap Chart', icon: 'bar_chart' },
    { id: 'learning' as const, label: 'Learning Path', icon: 'school' },
    { id: 'compare' as const, label: 'Compare', icon: 'compare_arrows' },
  ];

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* ================================================================ */}
      {/*  HEADER                                                          */}
      {/* ================================================================ */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,102,255,0.12) 0%, rgba(124,58,237,0.12) 40%, rgba(34,211,238,0.08) 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 8s ease infinite',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.03) 45%, transparent 60%)',
            backgroundSize: '250% 100%',
            animation: 'shimmer 4s ease-in-out infinite',
          }}
        />
        <div className="relative border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF]/20 to-[#7C3AED]/20 border border-[#0066FF]/20 flex items-center justify-center">
                    <Icon name="psychology" size={22} className="text-[#0066FF]" />
                  </div>
                </motion.div>
                <div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">
                    Skill Gap Simulator
                  </h1>
                  <p className="text-sm text-[#94A3B8]">
                    Pick any target role and see exactly what skills you need to get there
                  </p>
                </div>
              </div>
            </div>
            {selectedRole && analysisReady && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Badge variant="gradient" size="md">
                  {summaryStats.readiness}% Ready
                </Badge>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ================================================================ */}
      {/*  ROLE SELECTOR                                                   */}
      {/* ================================================================ */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-4">
          <Icon name="work" size={18} className="text-[#0066FF]" />
          <h2 className="text-lg font-bold text-white">Select Target Role</h2>
        </div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {roleDefinitions.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              isSelected={selectedRoleId === role.id || compareRoleId === role.id}
              onSelect={() => handleRoleSelect(role.id)}
            />
          ))}
        </motion.div>

        {/* Custom Role Input */}
        <motion.div variants={item} className="mt-4 flex items-end gap-3 max-w-md">
          <div className="flex-1">
            <Input
              icon="search"
              placeholder="Or type a custom role..."
              value={customRoleInput}
              onChange={(e) => setCustomRoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCustomRoleSubmit();
              }}
            />
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={handleCustomRoleSubmit}
            disabled={!customRoleInput.trim()}
          >
            Analyze
          </Button>
        </motion.div>
      </motion.div>

      {/* ================================================================ */}
      {/*  ANALYSIS LOADER                                                 */}
      {/* ================================================================ */}
      <AnimatePresence mode="wait">
        {isAnalyzing && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card glass>
              <AnalysisLoader />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  RESULTS AREA                                                    */}
      {/* ================================================================ */}
      <AnimatePresence mode="wait">
        {analysisReady && selectedRole && (
          <motion.div
            key="results"
            variants={container}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Summary Stats Row */}
            <motion.div
              variants={item}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            >
              <StatCard
                label="Overall Readiness"
                value={`${summaryStats.readiness}%`}
                icon="speed"
                accentColor={
                  summaryStats.readiness >= 70
                    ? '#10B981'
                    : summaryStats.readiness >= 45
                    ? '#F59E0B'
                    : '#EF4444'
                }
              />
              <StatCard
                label="Skills Met"
                value={`${summaryStats.skillsMet}/${summaryStats.totalSkills}`}
                icon="check_circle"
                accentColor="#10B981"
              />
              <StatCard
                label="Est. Time to Ready"
                value={`${summaryStats.estimatedWeeks} weeks`}
                icon="schedule"
                accentColor="#0066FF"
              />
              <StatCard
                label="Top Priority"
                value={summaryStats.topPriority[0] || 'None'}
                icon="priority_high"
                accentColor="#EF4444"
              />
            </motion.div>

            {/* Section Tabs */}
            <motion.div variants={item}>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      if (section.id === 'compare') handleCompareToggle();
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      activeSection === section.id
                        ? 'bg-[#0066FF]/15 text-[#0066FF] shadow-sm'
                        : 'text-[#64748B] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon name={section.icon} size={16} />
                    {section.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ============================================================ */}
            {/*  TAB: Current Skills Assessment                              */}
            {/* ============================================================ */}
            <AnimatePresence mode="wait">
              {activeSection === 'assessment' && (
                <motion.div
                  key="assessment"
                  variants={container}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <motion.div variants={item}>
                    <Card glass>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Icon name="tune" size={18} style={{ color: selectedRole.color }} />
                          <h3 className="text-base font-bold text-white">
                            Self-Assessment for {selectedRole.title}
                          </h3>
                        </div>
                        <p className="text-xs text-[#64748B]">
                          Drag sliders to adjust your skill levels
                        </p>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-white/[0.06]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-1.5 rounded-full bg-[#10B981]" />
                          <span className="text-[10px] text-[#64748B]">Met / Exceeded</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-1.5 rounded-full bg-[#F59E0B]" />
                          <span className="text-[10px] text-[#64748B]">Almost There</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-1.5 rounded-full bg-[#EF4444]" />
                          <span className="text-[10px] text-[#64748B]">Significant Gap</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-0.5 rounded-full bg-white/40" />
                          <span className="text-[10px] text-[#64748B]">Required Level</span>
                        </div>
                      </div>

                      {/* Grouped Skills */}
                      <div className="space-y-5">
                        {Object.entries(groupedSkills).map(([category, catSkills]) => (
                          <motion.div key={category} variants={fadeUp}>
                            <div className="flex items-center gap-2 mb-2">
                              <Icon
                                name={categoryIcons[category] || 'category'}
                                size={16}
                                className="text-[#64748B]"
                              />
                              <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                                {category}
                              </h4>
                              <div className="flex-1 h-px bg-white/[0.04]" />
                            </div>
                            <div className="space-y-0.5">
                              {catSkills.map((skill) => (
                                <SkillSlider
                                  key={skill.name}
                                  skill={skill}
                                  onChange={(val) => handleSkillChange(skill.name, val)}
                                  accentColor={selectedRole.color}
                                />
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              )}

              {/* ============================================================ */}
              {/*  TAB: Gap Analysis Chart                                     */}
              {/* ============================================================ */}
              {activeSection === 'chart' && (
                <motion.div
                  key="chart"
                  variants={container}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <motion.div variants={item}>
                    <Card glass>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <Icon name="bar_chart" size={18} style={{ color: selectedRole.color }} />
                          <h3 className="text-base font-bold text-white">
                            Skill Gap Comparison
                          </h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-3 h-2 rounded-sm"
                              style={{ background: selectedRole.color }}
                            />
                            <span className="text-[10px] text-[#94A3B8]">Your Level</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-2 rounded-sm border border-white/20 border-dashed" />
                            <span className="text-[10px] text-[#94A3B8]">Required Level</span>
                          </div>
                        </div>
                      </div>

                      <ComparisonChart skills={skills} accentColor={selectedRole.color} />

                      {/* Readiness Ring */}
                      <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-center gap-8">
                        <div className="relative w-24 h-24">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              fill="none"
                              stroke="rgba(255,255,255,0.04)"
                              strokeWidth="6"
                            />
                            <motion.circle
                              cx="50"
                              cy="50"
                              r="42"
                              fill="none"
                              stroke={
                                summaryStats.readiness >= 70
                                  ? '#10B981'
                                  : summaryStats.readiness >= 45
                                  ? '#F59E0B'
                                  : '#EF4444'
                              }
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={2 * Math.PI * 42}
                              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                              animate={{
                                strokeDashoffset:
                                  2 * Math.PI * 42 -
                                  (summaryStats.readiness / 100) * 2 * Math.PI * 42,
                              }}
                              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-extrabold text-white">
                              {summaryStats.readiness}%
                            </span>
                            <span className="text-[9px] text-[#64748B]">Ready</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon name="check_circle" size={14} className="text-[#10B981]" filled />
                            <span className="text-xs text-[#CBD5E1]">
                              {summaryStats.skillsMet} skills meet requirements
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="warning" size={14} className="text-[#F59E0B]" filled />
                            <span className="text-xs text-[#CBD5E1]">
                              {gapAnalysis.filter((g) => g.gap > 0 && g.gapPercent < 50).length} skills nearly there
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="error" size={14} className="text-[#EF4444]" filled />
                            <span className="text-xs text-[#CBD5E1]">
                              {gapAnalysis.filter((g) => g.gapPercent >= 50).length} skills need work
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              )}

              {/* ============================================================ */}
              {/*  TAB: Learning Path Estimation                              */}
              {/* ============================================================ */}
              {activeSection === 'learning' && (
                <motion.div
                  key="learning"
                  variants={container}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <motion.div variants={item}>
                    <Card glass padding="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon name="school" size={18} style={{ color: selectedRole.color }} />
                          <h3 className="text-base font-bold text-white">
                            Personalized Learning Path
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="accent" size="sm" dot>
                            {gapAnalysis.filter((g) => g.gap > 0).length} skills to improve
                          </Badge>
                          <Badge variant="default" size="sm">
                            ~{summaryStats.estimatedWeeks} weeks at 15 hrs/week
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Priority Legend */}
                  <motion.div variants={item} className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                      <span className="text-[10px] text-[#64748B]">Critical (50%+ gap)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                      <span className="text-[10px] text-[#64748B]">Important (25-50% gap)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                      <span className="text-[10px] text-[#64748B]">Nice to Have (&lt;25% gap)</span>
                    </div>
                  </motion.div>

                  {/* Learning Path Items */}
                  <motion.div variants={container} initial="hidden" animate="visible" className="space-y-2.5">
                    {gapAnalysis.map((gap, index) => (
                      <LearningPathItem
                        key={gap.skill.name}
                        gap={gap}
                        index={index}
                        accentColor={selectedRole.color}
                      />
                    ))}
                  </motion.div>

                  {/* Total Summary */}
                  <motion.div variants={item}>
                    <Card glass padding="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF]/20 to-[#7C3AED]/20 border border-[#0066FF]/20 flex items-center justify-center">
                            <Icon name="timeline" size={20} className="text-[#0066FF]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Total Learning Investment</p>
                            <p className="text-xs text-[#64748B]">
                              Based on closing all identified gaps
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-extrabold text-white">
                            {gapAnalysis.reduce((sum, g) => sum + g.estimatedHours, 0)} hours
                          </p>
                          <p className="text-xs text-[#64748B]">
                            ~{summaryStats.estimatedWeeks} weeks at 15 hrs/week
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-xl bg-error/5 border border-error/10">
                          <p className="text-lg font-bold text-[#EF4444]">
                            {gapAnalysis.filter((g) => g.priority === 'critical').length}
                          </p>
                          <p className="text-[10px] text-[#64748B]">Critical Skills</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-warning/5 border border-warning/10">
                          <p className="text-lg font-bold text-[#F59E0B]">
                            {gapAnalysis.filter((g) => g.priority === 'important').length}
                          </p>
                          <p className="text-[10px] text-[#64748B]">Important Skills</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-success/5 border border-success/10">
                          <p className="text-lg font-bold text-[#10B981]">
                            {gapAnalysis.filter((g) => g.priority === 'nice-to-have' || g.gap <= 0).length}
                          </p>
                          <p className="text-[10px] text-[#64748B]">On Track</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              )}

              {/* ============================================================ */}
              {/*  TAB: Compare Roles                                         */}
              {/* ============================================================ */}
              {activeSection === 'compare' && (
                <motion.div
                  key="compare"
                  variants={container}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  {!compareRoleId ? (
                    <motion.div variants={item}>
                      <Card glass>
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0066FF]/15 to-[#7C3AED]/15 border border-[#0066FF]/20 flex items-center justify-center mb-4">
                              <Icon name="compare_arrows" size={32} className="text-[#64748B]" />
                            </div>
                          </motion.div>
                          <h3 className="text-lg font-bold text-white mb-1">Compare Roles</h3>
                          <p className="text-sm text-[#94A3B8] max-w-md mb-4">
                            You have <span className="text-white font-medium">{selectedRole.title}</span> selected.
                            Now click on another role card above to compare them side by side.
                          </p>
                          <Badge variant="accent" size="md">
                            Click any other role to compare
                          </Badge>
                        </div>
                      </Card>
                    </motion.div>
                  ) : compareRole ? (
                    <RoleComparison
                      roleA={selectedRole}
                      roleB={compareRole}
                      skillsA={skills}
                      skillsB={compareSkills}
                    />
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  Empty State (no role selected)                                  */}
      {/* ================================================================ */}
      {!selectedRoleId && !isAnalyzing && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card glass>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0066FF]/15 to-[#7C3AED]/15 border border-[#0066FF]/15 flex items-center justify-center mb-5">
                  <Icon name="psychology" size={40} className="text-[#64748B]" />
                </div>
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2">
                What role do you want to explore?
              </h2>
              <p className="text-sm text-[#94A3B8] max-w-md">
                Select a target role from the cards above or type a custom role. Our simulator will
                analyze your skill gaps and create a personalized learning path to get you there.
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ================================================================ */}
      {/*  Keyframes                                                       */}
      {/* ================================================================ */}
      <style>{`
        @keyframes gradient-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.15);
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(0,102,255,0.3);
        }
      `}</style>
    </motion.div>
  );
};

export default SkillSimulator;
