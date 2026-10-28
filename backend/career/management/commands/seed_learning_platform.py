import re
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from career.models import (
    LearningResource,
    LearningPath,
    LearningPathStep
)
from career.services.youtube import get_youtube_thumbnail_url

GENUINE_RESOURCES = [
    # ==========================================
    # 1. FRONTEND & WEB FOUNDATIONS
    # ==========================================
    {
        "title": "HTML & CSS Full Course - Beginner to Pro",
        "provider": "FreeCodeCamp",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=mU6anWqZJcc",
        "youtube_video_id": "mU6anWqZJcc",
        "description": "Comprehensive HTML and CSS foundation covering responsive layouts, modern Flexbox, CSS Grid, semantic elements, and production design systems.",
        "skills_covered": ["HTML5", "CSS3", "Responsive Design", "Flexbox", "CSS Grid"],
        "target_roles": ["Frontend Developer", "Software Engineer", "UI/UX Designer"],
        "difficulty": "Beginner",
        "estimated_duration": "6 hours",
        "duration_seconds": 21600.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },
    {
        "title": "JavaScript Programming - Full Course",
        "provider": "FreeCodeCamp",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=jS4aFq5-91M",
        "youtube_video_id": "jS4aFq5-91M",
        "description": "In-depth modern JavaScript programming fundamentals from core variables, DOM manipulation, arrays, objects, to closures, promises, and async/await.",
        "skills_covered": ["JavaScript", "ES6+", "Async Programming", "DOM Manipulation", "Event Loop"],
        "target_roles": ["Frontend Developer", "Backend Developer", "Software Engineer"],
        "difficulty": "Beginner",
        "estimated_duration": "8 hours",
        "duration_seconds": 28800.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },
    {
        "title": "MDN Web Docs: Modern JavaScript Guide",
        "provider": "MDN Web Docs",
        "resource_type": "documentation",
        "external_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
        "youtube_video_id": "",
        "description": "The definitive, industry-standard reference manual for modern JavaScript specifications, web APIs, memory models, and standard browser runtime architectures.",
        "skills_covered": ["JavaScript", "Web APIs", "Browser Internals", "Data Types", "Functions"],
        "target_roles": ["Frontend Developer", "Software Engineer", "Backend Developer"],
        "difficulty": "Intermediate",
        "estimated_duration": "12 hours",
        "duration_seconds": 43200.0,
        "pricing_classification": "free",
        "is_official_documentation": True,
        "certification_available": False,
    },
    {
        "title": "React 18 & Modern Hooks Tutorial",
        "provider": "FreeCodeCamp",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=bMknfKXIFA8",
        "youtube_video_id": "bMknfKXIFA8",
        "description": "Practical component-driven UI architecture with React 18: state management, useEffect lifecycles, custom hooks, context API, and component composition.",
        "skills_covered": ["React", "React Hooks", "State Management", "Component Architecture", "Single Page Applications"],
        "target_roles": ["Frontend Developer", "Software Engineer"],
        "difficulty": "Intermediate",
        "estimated_duration": "11 hours",
        "duration_seconds": 39600.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },
    {
        "title": "Official React Documentation: Quick Start & Learn",
        "provider": "React Core Team",
        "resource_type": "documentation",
        "external_url": "https://react.dev/learn",
        "youtube_video_id": "",
        "description": "Official interactive documentation from Meta's React core team, illustrating pure rendering principles, component state lifecycles, and modern best practices.",
        "skills_covered": ["React", "UI State", "Component Tree", "Virtual DOM"],
        "target_roles": ["Frontend Developer", "Software Engineer"],
        "difficulty": "Intermediate",
        "estimated_duration": "5 hours",
        "duration_seconds": 18000.0,
        "pricing_classification": "free",
        "is_official_documentation": True,
        "certification_available": False,
    },
    {
        "title": "TypeScript Full Course for Beginners",
        "provider": "FreeCodeCamp",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=8j0UDiN7my4",
        "youtube_video_id": "8j0UDiN7my4",
        "description": "Static typing for modern applications: interfaces, generics, type guards, unions, utility types, and strict compiler configurations for production codebases.",
        "skills_covered": ["TypeScript", "Type Systems", "Generics", "Type Safety", "Interfaces"],
        "target_roles": ["Frontend Developer", "Backend Developer", "Software Engineer"],
        "difficulty": "Intermediate",
        "estimated_duration": "5 hours",
        "duration_seconds": 18000.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },
    {
        "title": "Next.js 14 Full Stack Development Course",
        "provider": "JavaScript Mastery",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk",
        "youtube_video_id": "W6NZfCO5SIk",
        "description": "Modern full-stack web development using Next.js App Router, React Server Components (RSC), server actions, optimized asset delivery, and API routes.",
        "skills_covered": ["Next.js", "React Server Components", "SSR", "Server Actions", "Full Stack Development"],
        "target_roles": ["Frontend Developer", "Software Engineer"],
        "difficulty": "Advanced",
        "estimated_duration": "4 hours",
        "duration_seconds": 14400.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },

    # ==========================================
    # 2. BACKEND, PYTHON & DISTRIBUTED SYSTEMS
    # ==========================================
    {
        "title": "Python for Beginners - Full Course",
        "provider": "FreeCodeCamp",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=rfscVS0vtbw",
        "youtube_video_id": "rfscVS0vtbw",
        "description": "Comprehensive introduction to the Python 3 language, idiomatic syntax, data structures (lists, dicts, tuples), object-oriented programming, and file operations.",
        "skills_covered": ["Python", "Object-Oriented Programming", "Data Structures", "Scripting"],
        "target_roles": ["Backend Developer", "Software Engineer", "Data Scientist", "Machine Learning Engineer"],
        "difficulty": "Beginner",
        "estimated_duration": "4.5 hours",
        "duration_seconds": 16200.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },
    {
        "title": "The Python Tutorial (Official 3.12+)",
        "provider": "Python Software Foundation",
        "resource_type": "documentation",
        "external_url": "https://docs.python.org/3/tutorial/",
        "youtube_video_id": "",
        "description": "Official canonical tutorial from the Python language creators covering language mechanics, standard library modules, error handling, iterators, and generators.",
        "skills_covered": ["Python", "Standard Library", "Generators", "Exceptions", "Modules"],
        "target_roles": ["Backend Developer", "Software Engineer", "Data Scientist"],
        "difficulty": "Intermediate",
        "estimated_duration": "6 hours",
        "duration_seconds": 21600.0,
        "pricing_classification": "free",
        "is_official_documentation": True,
        "certification_available": False,
    },
    {
        "title": "FastAPI - Full Modern Backend API Course",
        "provider": "FreeCodeCamp",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=tLKKmouUAMS",
        "youtube_video_id": "tLKKmouUAMS",
        "description": "Build production-grade REST and asynchronous web APIs in Python using FastAPI, Pydantic type validation, SQLAlchemy ORM, JWT security, and Docker packaging.",
        "skills_covered": ["FastAPI", "Python", "REST APIs", "Pydantic", "SQLAlchemy", "JWT Authentication"],
        "target_roles": ["Backend Developer", "Software Engineer"],
        "difficulty": "Intermediate",
        "estimated_duration": "19 hours",
        "duration_seconds": 68400.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },
    {
        "title": "SQL Tutorial - Full Database Course for Beginners",
        "provider": "FreeCodeCamp",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=HXV3zeRR3h4",
        "youtube_video_id": "HXV3zeRR3h4",
        "description": "Relational database essentials: schema design, SQL DDL/DML, JOIN operations, aggregations, subqueries, indexing, and transactional isolation fundamentals.",
        "skills_covered": ["SQL", "Relational Databases", "Data Modeling", "Queries", "Indexing"],
        "target_roles": ["Backend Developer", "Software Engineer", "Data Scientist", "Data Analyst"],
        "difficulty": "Beginner",
        "estimated_duration": "4 hours",
        "duration_seconds": 14400.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },
    {
        "title": "PostgreSQL 16 Official Tutorial & SQL Guide",
        "provider": "PostgreSQL Global Development Group",
        "resource_type": "documentation",
        "external_url": "https://www.postgresql.org/docs/current/tutorial.html",
        "youtube_video_id": "",
        "description": "Comprehensive reference guide for enterprise PostgreSQL: ACID transactions, foreign keys, window functions, JSONB queries, and query planning with EXPLAIN.",
        "skills_covered": ["PostgreSQL", "Database Design", "Transactions", "ACID", "Query Optimization"],
        "target_roles": ["Backend Developer", "Software Engineer", "Cloud Engineer"],
        "difficulty": "Intermediate",
        "estimated_duration": "7 hours",
        "duration_seconds": 25200.0,
        "pricing_classification": "free",
        "is_official_documentation": True,
        "certification_available": False,
    },
    {
        "title": "System Design for Beginners - Architecture Fundamentals",
        "provider": "FreeCodeCamp",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=M6nzN51oYg8",
        "youtube_video_id": "M6nzN51oYg8",
        "description": "Core distributed system architecture patterns: load balancers, CDN caching, database sharding, CAP theorem, message queues (Kafka/RabbitMQ), and rate limiting.",
        "skills_covered": ["System Design", "Scalability", "Caching", "Load Balancing", "Microservices"],
        "target_roles": ["Backend Developer", "Software Engineer", "Cloud Engineer"],
        "difficulty": "Advanced",
        "estimated_duration": "2.5 hours",
        "duration_seconds": 9000.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },

    # ==========================================
    # 3. DATA STRUCTURES, ALGORITHMS & CS CORE
    # ==========================================
    {
        "title": "Data Structures Easy to Advanced Course",
        "provider": "FreeCodeCamp / William Fiset",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=RBSGKlAvoiM",
        "youtube_video_id": "RBSGKlAvoiM",
        "description": "Visual, algorithmic deep-dive into fundamental computer science data structures: Dynamic Arrays, Linked Lists, Stacks, Queues, Binary Trees, Priority Queues, and Graphs.",
        "skills_covered": ["Data Structures", "Algorithms", "Time Complexity", "Big O", "Graph Theory"],
        "target_roles": ["Software Engineer", "Backend Developer", "Frontend Developer"],
        "difficulty": "Intermediate",
        "estimated_duration": "8 hours",
        "duration_seconds": 28800.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },
    {
        "title": "CS50x: Introduction to Computer Science",
        "provider": "Harvard University",
        "resource_type": "course",
        "external_url": "https://cs50.harvard.edu/x/",
        "youtube_video_id": "",
        "description": "Harvard University's flagship computer science program teaching algorithmic thinking, problem-solving, C programming, memory allocation, Python, SQL, and web applications.",
        "skills_covered": ["Computer Science Fundamentals", "C", "Memory Management", "Algorithms", "Problem Solving"],
        "target_roles": ["Software Engineer", "Backend Developer", "Frontend Developer"],
        "difficulty": "Beginner to Intermediate",
        "estimated_duration": "12 weeks",
        "duration_seconds": 86400.0,
        "pricing_classification": "free_with_paid_cert",
        "is_official_documentation": False,
        "certification_available": True,
    },
    {
        "title": "Git and GitHub for Beginners - Crash Course",
        "provider": "FreeCodeCamp",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=V4wZ9dJmU-g",
        "youtube_video_id": "V4wZ9dJmU-g",
        "description": "Essential version control commands for modern team engineering: git branching, rebasing, pull requests, resolving merge conflicts, and GitHub Actions CI pipelines.",
        "skills_covered": ["Git", "GitHub", "Version Control", "Collaboration", "CI/CD"],
        "target_roles": ["Software Engineer", "Frontend Developer", "Backend Developer", "Cloud Engineer"],
        "difficulty": "Beginner",
        "estimated_duration": "1 hour",
        "duration_seconds": 3600.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },

    # ==========================================
    # 4. CLOUD, DEVOPS & INFRASTRUCTURE
    # ==========================================
    {
        "title": "Docker for Beginners - Containerization Full Course",
        "provider": "FreeCodeCamp",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=fqMOX6JJhGo",
        "youtube_video_id": "fqMOX6JJhGo",
        "description": "Master containerization from scratch: Dockerfile writing, multi-stage builds, container networking, volume mounting, and multi-container Docker Compose stacks.",
        "skills_covered": ["Docker", "Containers", "DevOps", "Docker Compose", "Microservices"],
        "target_roles": ["Cloud Engineer", "Backend Developer", "Software Engineer"],
        "difficulty": "Intermediate",
        "estimated_duration": "2.5 hours",
        "duration_seconds": 9000.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },
    {
        "title": "AWS Cloud Practitioner Essentials (Official)",
        "provider": "AWS Skill Builder",
        "resource_type": "course",
        "external_url": "https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials",
        "youtube_video_id": "",
        "description": "Official free interactive curriculum from Amazon Web Services introducing cloud compute (EC2), storage (S3), databases (RDS), security (IAM), and global architecture.",
        "skills_covered": ["AWS", "Cloud Computing", "EC2", "S3", "Cloud Security"],
        "target_roles": ["Cloud Engineer", "Backend Developer", "Software Engineer"],
        "difficulty": "Beginner",
        "estimated_duration": "6 hours",
        "duration_seconds": 21600.0,
        "pricing_classification": "free",
        "is_official_documentation": True,
        "certification_available": True,
    },
    {
        "title": "AWS Certified Cloud Practitioner Video Course",
        "provider": "FreeCodeCamp",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=ulprqHHWlng",
        "youtube_video_id": "ulprqHHWlng",
        "description": "Complete exam-focused preparation course covering core AWS infrastructure services, security compliance, pricing models, and cloud architectural best practices.",
        "skills_covered": ["AWS", "Cloud Architecture", "IAM", "VPC", "Serverless"],
        "target_roles": ["Cloud Engineer", "Software Engineer"],
        "difficulty": "Beginner to Intermediate",
        "estimated_duration": "14 hours",
        "duration_seconds": 50400.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },
    {
        "title": "AZ-900: Microsoft Azure Fundamentals Guide",
        "provider": "Microsoft Learn",
        "resource_type": "course",
        "external_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
        "youtube_video_id": "",
        "description": "Official self-paced Microsoft learning track covering cloud models, core Azure architectural components, security governance, and compliance management.",
        "skills_covered": ["Azure", "Cloud Architecture", "Governance", "Virtual Machines", "Cloud Security"],
        "target_roles": ["Cloud Engineer", "Software Engineer"],
        "difficulty": "Beginner",
        "estimated_duration": "8 hours",
        "duration_seconds": 28800.0,
        "pricing_classification": "free",
        "is_official_documentation": True,
        "certification_available": True,
    },

    # ==========================================
    # 5. MACHINE LEARNING & AI ENGINEERING
    # ==========================================
    {
        "title": "Machine Learning with Python - Full Course",
        "provider": "FreeCodeCamp",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=i_LwzRVP7bg",
        "youtube_video_id": "i_LwzRVP7bg",
        "description": "Supervised and unsupervised learning with NumPy, Pandas, Scikit-Learn: Linear Regression, Logistic Classification, Decision Trees, K-Means clustering, and model validation.",
        "skills_covered": ["Machine Learning", "Python", "Scikit-Learn", "Data Science", "Pandas", "NumPy"],
        "target_roles": ["Machine Learning Engineer", "Data Scientist", "Software Engineer"],
        "difficulty": "Intermediate",
        "estimated_duration": "10 hours",
        "duration_seconds": 36000.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },
    {
        "title": "Neural Networks: Zero to Hero (PyTorch & Transformers)",
        "provider": "Andrej Karpathy",
        "resource_type": "video",
        "external_url": "https://www.youtube.com/watch?v=VMj-3S1tku0",
        "youtube_video_id": "VMj-3S1tku0",
        "description": "First-principles engineering of deep learning systems from scratch: backpropagation, micrograd engine, multi-layer perceptrons, wavelets, and building GPT from the ground up.",
        "skills_covered": ["Deep Learning", "PyTorch", "Neural Networks", "Transformers", "LLMs"],
        "target_roles": ["Machine Learning Engineer", "Software Engineer"],
        "difficulty": "Advanced",
        "estimated_duration": "2.5 hours",
        "duration_seconds": 9000.0,
        "pricing_classification": "free",
        "is_official_documentation": False,
        "certification_available": False,
    },
    {
        "title": "ChatGPT & LLM Application Engineering Course",
        "provider": "DeepLearning.AI",
        "resource_type": "course",
        "external_url": "https://www.deeplearning.ai/short-courses/",
        "youtube_video_id": "",
        "description": "Industry-standard best practices for building real-world AI applications with Large Language Models: structured outputs, RAG vector pipelines, and evaluation metrics.",
        "skills_covered": ["LLM Engineering", "Prompt Engineering", "RAG", "Embeddings", "Generative AI"],
        "target_roles": ["Machine Learning Engineer", "Software Engineer", "Backend Developer"],
        "difficulty": "Intermediate",
        "estimated_duration": "3 hours",
        "duration_seconds": 10800.0,
        "pricing_classification": "free",
        "is_official_documentation": True,
        "certification_available": False,
    },
]

STRUCTURED_PATHS = [
    {
        "title": "Full-Stack Software Engineer Career Path",
        "target_role": "Software Engineer",
        "target_industry": "Technology & SaaS",
        "difficulty": "Beginner to Advanced",
        "estimated_weeks": 14,
        "description": "Complete professional curriculum from core computer science thinking, modern frontend engineering, robust backend services, to production system architecture.",
        "steps": [
            ("HTML & CSS Full Course - Beginner to Pro", "fundamentals", "Master foundational semantics and modern responsive layout structures."),
            ("JavaScript Programming - Full Course", "fundamentals", "Acquire deep proficiency in JavaScript language mechanics and asynchronous programming."),
            ("React 18 & Modern Hooks Tutorial", "core_technical", "Build modular, component-driven user interfaces with state preservation."),
            ("Python for Beginners - Full Course", "core_technical", "Learn Python programming for high-throughput server backends and automation."),
            ("FastAPI - Full Modern Backend API Course", "core_technical", "Develop typed REST APIs with database persistence and JWT authorization."),
            ("SQL Tutorial - Full Database Course for Beginners", "core_technical", "Design normalized relational schemas and execute efficient database queries."),
            ("Data Structures Easy to Advanced Course", "applied_practice", "Implement essential data structures and master algorithmic problem solving."),
            ("Docker for Beginners - Containerization Full Course", "applied_practice", "Package applications into containerized microservices ready for cloud deployment."),
            ("System Design for Beginners - Architecture Fundamentals", "interview_prep", "Design scalable architectures and prepare for high-level technical engineering reviews.")
        ]
    },
    {
        "title": "Modern Frontend Developer Path",
        "target_role": "Frontend Developer",
        "target_industry": "Web Technology",
        "difficulty": "Beginner to Intermediate",
        "estimated_weeks": 10,
        "description": "Curated path focusing on modern web standards, reactive client architectures, performance optimization, and scalable single-page applications.",
        "steps": [
            ("HTML & CSS Full Course - Beginner to Pro", "fundamentals", "Master responsive UI layouts, accessibility, and modern CSS architecture."),
            ("JavaScript Programming - Full Course", "fundamentals", "Establish deep fluency in modern ECMAScript specifications and DOM interaction."),
            ("MDN Web Docs: Modern JavaScript Guide", "fundamentals", "Study the official reference for runtime memory models and browser APIs."),
            ("React 18 & Modern Hooks Tutorial", "core_technical", "Build interactive reactive components with modern state lifecycles."),
            ("TypeScript Full Course for Beginners", "core_technical", "Adopt static typing and interfaces to prevent production regressions."),
            ("Next.js 14 Full Stack Development Course", "applied_practice", "Leverage React Server Components, hybrid rendering, and route optimization."),
            ("Git and GitHub for Beginners - Crash Course", "portfolio_projects", "Manage code changes and collaborate through pull requests and code reviews.")
        ]
    },
    {
        "title": "Backend Systems & Cloud Engineering Path",
        "target_role": "Backend Developer",
        "target_industry": "Cloud Platforms & Enterprise",
        "difficulty": "Intermediate to Advanced",
        "estimated_weeks": 12,
        "description": "Designed for engineers building scalable server architectures, resilient database tiers, authenticated APIs, and distributed systems.",
        "steps": [
            ("Python for Beginners - Full Course", "fundamentals", "Establish strong object-oriented and functional programming skills in Python."),
            ("The Python Tutorial (Official 3.12+)", "fundamentals", "Deepen understanding of memory management, iterators, and modules."),
            ("SQL Tutorial - Full Database Course for Beginners", "core_technical", "Master relational algebra, complex joins, and query indexing."),
            ("PostgreSQL 16 Official Tutorial & SQL Guide", "core_technical", "Understand ACID compliance, transactions, and performance tuning."),
            ("FastAPI - Full Modern Backend API Course", "core_technical", "Build production-ready, asynchronous web services with automated OpenAPI docs."),
            ("Docker for Beginners - Containerization Full Course", "applied_practice", "Containerize distributed backend services with Docker Compose."),
            ("AWS Certified Cloud Practitioner Video Course", "applied_practice", "Provision secure cloud infrastructure, virtual networks, and object storage."),
            ("System Design for Beginners - Architecture Fundamentals", "interview_prep", "Prepare for senior backend architecture interviews and design distributed systems.")
        ]
    },
    {
        "title": "Machine Learning & AI Engineering Path",
        "target_role": "Machine Learning Engineer",
        "target_industry": "Artificial Intelligence & Analytics",
        "difficulty": "Intermediate to Advanced",
        "estimated_weeks": 14,
        "description": "End-to-end curriculum bridging core Python, scientific computing, statistical modeling, neural networks, and modern LLM application engineering.",
        "steps": [
            ("Python for Beginners - Full Course", "fundamentals", "Master Python scripting, vectorized syntax, and object design."),
            ("Machine Learning with Python - Full Course", "core_technical", "Build predictive models with Scikit-Learn, Pandas, and evaluation metrics."),
            ("Neural Networks: Zero to Hero (PyTorch & Transformers)", "core_technical", "Implement backpropagation and build transformer architectures from scratch in PyTorch."),
            ("ChatGPT & LLM Application Engineering Course", "applied_practice", "Engineer Retrieval-Augmented Generation (RAG) systems with vector databases."),
            ("Docker for Beginners - Containerization Full Course", "applied_practice", "Containerize AI models and inference servers for scalable deployment.")
        ]
    },
    {
        "title": "Cloud Architecture & DevOps Specialist Path",
        "target_role": "Cloud Engineer",
        "target_industry": "Cloud Computing",
        "difficulty": "Beginner to Advanced",
        "estimated_weeks": 10,
        "description": "Learn to automate, provision, and maintain resilient cloud infrastructure across Amazon Web Services and Microsoft Azure.",
        "steps": [
            ("Git and GitHub for Beginners - Crash Course", "fundamentals", "Master Git workflows, branching strategies, and CI trigger pipelines."),
            ("Docker for Beginners - Containerization Full Course", "core_technical", "Isolate microservice dependencies and orchestrate multi-container environments."),
            ("AWS Cloud Practitioner Essentials (Official)", "core_technical", "Understand enterprise cloud architectures, compute, security, and networking."),
            ("AWS Certified Cloud Practitioner Video Course", "core_technical", "Deepen preparation for formal cloud accreditation."),
            ("AZ-900: Microsoft Azure Fundamentals Guide", "applied_practice", "Learn multi-cloud enterprise patterns across Azure and AWS."),
            ("System Design for Beginners - Architecture Fundamentals", "interview_prep", "Design high-availability cloud systems with automated failover.")
        ]
    }
]

class Command(BaseCommand):
    help = "Seeds genuine verified learning resources and structured role-based learning paths."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding genuine Learning Resources..."))
        resource_map = {}

        for item in GENUINE_RESOURCES:
            slug = slugify(item["title"])
            thumbnail = item.get("thumbnail_url") or ""
            if not thumbnail and item.get("youtube_video_id"):
                thumbnail = get_youtube_thumbnail_url(item["youtube_video_id"])

            res, created = LearningResource.objects.update_or_create(
                slug=slug,
                defaults={
                    "title": item["title"],
                    "provider": item["provider"],
                    "resource_type": item["resource_type"],
                    "external_url": item["external_url"],
                    "youtube_video_id": item.get("youtube_video_id", ""),
                    "description": item["description"],
                    "skills_covered": item["skills_covered"],
                    "target_roles": item["target_roles"],
                    "difficulty": item["difficulty"],
                    "estimated_duration": item["estimated_duration"],
                    "duration_seconds": item.get("duration_seconds", 0.0),
                    "pricing_classification": item["pricing_classification"],
                    "is_official_documentation": item.get("is_official_documentation", False),
                    "certification_available": item.get("certification_available", False),
                    "verification_status": "verified_active",
                    "thumbnail_url": thumbnail,
                }
            )
            resource_map[item["title"]] = res
            status = "Created" if created else "Updated"
            self.stdout.write(f"  [{status}] {res.title} ({res.provider})")

        self.stdout.write(self.style.NOTICE("\nSeeding structured Learning Paths..."))

        for path_data in STRUCTURED_PATHS:
            path_slug = slugify(path_data["title"])
            path, created = LearningPath.objects.update_or_create(
                slug=path_slug,
                defaults={
                    "title": path_data["title"],
                    "target_role": path_data["target_role"],
                    "target_industry": path_data["target_industry"],
                    "difficulty": path_data["difficulty"],
                    "estimated_weeks": path_data["estimated_weeks"],
                    "description": path_data["description"],
                    "is_featured": True
                }
            )
            status = "Created" if created else "Updated"
            self.stdout.write(f"  [{status}] Path: {path.title} for {path.target_role}")

            # Re-create steps
            LearningPathStep.objects.filter(path=path).delete()
            for idx, (res_title, phase_cat, objective) in enumerate(path_data["steps"], start=1):
                res = resource_map.get(res_title)
                if res:
                    LearningPathStep.objects.create(
                        path=path,
                        resource=res,
                        step_number=idx,
                        phase_category=phase_cat,
                        learning_objective=objective,
                        order=idx
                    )

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded {len(GENUINE_RESOURCES)} learning resources and {len(STRUCTURED_PATHS)} structured paths!"
        ))
