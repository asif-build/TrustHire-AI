from django.core.management.base import BaseCommand
from career.models import SkillAssessment

class Command(BaseCommand):
    help = 'Seeds verified skill assessments for Python, SQL, React, Docker, System Design, and REST APIs'

    def handle(self, *args, **options):
        assessments_data = [
            {
                'title': 'Python Production Engineering Assessment',
                'slug': 'python-production-engineering',
                'skill_name': 'Python',
                'assessment_type': 'code_challenge',
                'difficulty': 'Intermediate',
                'time_limit_minutes': 20,
                'passing_score': 75.0,
                'description': 'Validates idiomatic Python, generator comprehension, exception handling, and production async concurrency principles.',
                'evaluation_rubric': 'Requires understanding of Python data structures, decorators, generator efficiency, and proper resource management.',
                'questions': [
                    {
                        'id': 'py-q1',
                        'prompt': 'Which Python construct is most appropriate for processing a 50GB log file without exhausting memory?',
                        'type': 'multiple_choice',
                        'options': [
                            'Read the entire file into a list with file.readlines()',
                            'Use a generator expression or line-by-line file iterator (yield from)',
                            'Store all lines into a dictionary keyed by timestamp',
                            'Use json.load() on the entire file object'
                        ],
                        'correct_option_index': 1,
                        'explanation': 'Generators and iterator protocols evaluate lazily (O(1) memory), making them the standard pattern for streaming large datasets in Python.'
                    },
                    {
                        'id': 'py-q2',
                        'prompt': 'Write a Python function or list comprehension that filters a list of dictionaries `users` to include only active users (`user["is_active"] == True`) and extracts their email address.',
                        'type': 'code_challenge',
                        'required_keywords': ['for', 'is_active', 'email'],
                        'min_keywords': 3,
                        'explanation': 'A comprehension such as `[u["email"] for u in users if u.get("is_active")]` demonstrates concise, idiomatic filtering.'
                    },
                    {
                        'id': 'py-q3',
                        'prompt': 'What is the primary purpose of Python’s Global Interpreter Lock (GIL) in CPython?',
                        'type': 'multiple_choice',
                        'options': [
                            'To accelerate mathematical operations on GPUs',
                            'To prevent memory corruption by ensuring only one thread executes Python bytecode at a time',
                            'To compile Python code directly into machine assembly before runtime',
                            'To encrypt variable names in memory'
                        ],
                        'correct_option_index': 1,
                        'explanation': 'In CPython, the GIL protects Python object memory management from multi-threaded race conditions by serializing execution of native bytecode.'
                    },
                    {
                        'id': 'py-q4',
                        'prompt': 'In Python, what is the key difference between `deepcopy` and shallow `copy`?',
                        'type': 'multiple_choice',
                        'options': [
                            '`deepcopy` converts objects to strings, while shallow copy keeps them binary',
                            '`deepcopy` recursively clones nested compound objects, whereas shallow copy copies references to nested objects',
                            '`deepcopy` works only on tuples and sets',
                            'Shallow copy is thread-safe while `deepcopy` is not'
                        ],
                        'correct_option_index': 1,
                        'explanation': 'Shallow copy constructs a new collection and inserts references to the existing items; deepcopy recursively duplicates all child objects.'
                    }
                ]
            },
            {
                'title': 'SQL Querying & Relational Modeling Assessment',
                'slug': 'sql-relational-modeling',
                'skill_name': 'SQL',
                'assessment_type': 'sql_challenge',
                'difficulty': 'Intermediate',
                'time_limit_minutes': 25,
                'passing_score': 70.0,
                'description': 'Validates multi-table joins, window functions, aggregation, index selection, and ACID transaction semantics.',
                'evaluation_rubric': 'Requires correct SQL syntax, appropriate join predicates, grouping clauses, and index strategy knowledge.',
                'questions': [
                    {
                        'id': 'sql-q1',
                        'prompt': 'Write an SQL query to retrieve the customer_id and total order value (sum of total_amount) from `orders`, grouped by customer_id, having total order value exceeding 1000.',
                        'type': 'sql_challenge',
                        'required_keywords': ['select', 'group by', 'having', 'sum'],
                        'min_keywords': 4,
                        'explanation': 'Must use `GROUP BY customer_id HAVING SUM(total_amount) > 1000` because aggregated predicates require HAVING rather than WHERE.'
                    },
                    {
                        'id': 'sql-q2',
                        'prompt': 'What is the primary difference between `LEFT JOIN` and `INNER JOIN` in relational SQL?',
                        'type': 'multiple_choice',
                        'options': [
                            '`LEFT JOIN` sorts the result in descending order by primary key',
                            '`LEFT JOIN` returns all records from the left table, plus matching records from the right table (with NULLs for non-matches)',
                            '`INNER JOIN` returns unmatched rows with zeros instead of NULLs',
                            '`INNER JOIN` is strictly faster on unindexed columns'
                        ],
                        'correct_option_index': 1,
                        'explanation': 'LEFT JOIN preserves all rows from the left relation, filling non-matching right attributes with NULL values.'
                    },
                    {
                        'id': 'sql-q3',
                        'prompt': 'Which SQL clause is used to calculate a running total across partition boundaries without collapsing rows into a single group?',
                        'type': 'multiple_choice',
                        'options': [
                            'GROUP BY ROLLUP',
                            'OVER (PARTITION BY ... ORDER BY ...)',
                            'HAVING COUNT(*)',
                            'UNION ALL DISTINCT'
                        ],
                        'correct_option_index': 1,
                        'explanation': 'Window functions using the `OVER (...)` clause compute aggregate metrics across sliding or partitioned rows while preserving individual records.'
                    }
                ]
            },
            {
                'title': 'React & Modern Frontend Architecture Assessment',
                'slug': 'react-frontend-architecture',
                'skill_name': 'React',
                'assessment_type': 'quiz',
                'difficulty': 'Intermediate',
                'time_limit_minutes': 20,
                'passing_score': 75.0,
                'description': 'Evaluates modern React hooks (useState, useEffect, useMemo, useCallback), component lifecycles, state colocation, and render performance.',
                'evaluation_rubric': 'Tests practical comprehension of React reconciliation, dependency arrays, state management, and side effects.',
                'questions': [
                    {
                        'id': 'react-q1',
                        'prompt': 'Why is mutating state directly (e.g., `state.items.push(newItem)`) discouraged in React?',
                        'type': 'multiple_choice',
                        'options': [
                            'It causes JavaScript memory leaks in V8 engine',
                            'React relies on shallow equality comparisons of state references to trigger re-renders; in-place mutations do not change reference identity',
                            'Mutating state converts variables to read-only strings',
                            'React components can only render numbers and booleans'
                        ],
                        'correct_option_index': 1,
                        'explanation': 'React components re-render when state references change. Mutating an existing object in-place preserves the reference pointer, so React cannot detect changes.'
                    },
                    {
                        'id': 'react-q2',
                        'prompt': 'When should you pass an empty dependency array `[]` to `useEffect`?',
                        'type': 'multiple_choice',
                        'options': [
                            'When the effect must run on every state change',
                            'When the effect should execute only once after initial mount and clean up on unmount',
                            'When the effect should never execute at all',
                            'When the effect is an asynchronous server component'
                        ],
                        'correct_option_index': 1,
                        'explanation': 'An empty dependency array signifies no reactive values change, scheduling the effect to run strictly once after initial mount.'
                    },
                    {
                        'id': 'react-q3',
                        'prompt': 'What does `useMemo` do in React?',
                        'type': 'multiple_choice',
                        'options': [
                            'Persists state to localStorage automatically',
                            'Memoizes the result of an expensive calculation between re-renders until specified dependencies change',
                            'Renders components in a separate web worker thread',
                            'Encrypts component props for secure network transport'
                        ],
                        'correct_option_index': 1,
                        'explanation': '`useMemo` caches the calculated return value of a function between re-renders, recalculating only when declared dependencies update.'
                    }
                ]
            },
            {
                'title': 'Docker & Containerization Essentials Assessment',
                'slug': 'docker-containerization-essentials',
                'skill_name': 'Docker',
                'assessment_type': 'code_challenge',
                'difficulty': 'Intermediate',
                'time_limit_minutes': 20,
                'passing_score': 70.0,
                'description': 'Assesses Dockerfile multi-stage builds, layer caching, volume persistence, network isolation, and container security.',
                'evaluation_rubric': 'Validates knowledge of immutable image packaging, rootless containers, and multi-stage build optimization.',
                'questions': [
                    {
                        'id': 'doc-q1',
                        'prompt': 'What is the primary benefit of using multi-stage builds in a Dockerfile?',
                        'type': 'multiple_choice',
                        'options': [
                            'Allows running multiple operating systems inside a single container simultaneously',
                            'Significantly reduces final image size by discarding build tools and compilers from the runtime image',
                            'Encrypts the container filesystem against root access',
                            'Automatically provisions Kubernetes clusters'
                        ],
                        'correct_option_index': 1,
                        'explanation': 'Multi-stage builds allow developers to compile artifacts in an intermediate build stage and copy only the runtime artifacts into a lean base image (e.g. alpine/distroless).'
                    },
                    {
                        'id': 'doc-q2',
                        'prompt': 'Which Docker instruction specifies the default executable and arguments that always run when a container starts?',
                        'type': 'multiple_choice',
                        'options': [
                            'RUN',
                            'ENTRYPOINT',
                            'MAINTAINER',
                            'EXPOSE'
                        ],
                        'correct_option_index': 1,
                        'explanation': 'ENTRYPOINT configures a container that will run as an executable, whereas CMD provides default arguments that can be overridden.'
                    },
                    {
                        'id': 'doc-q3',
                        'prompt': 'Why should you order Dockerfile commands from least frequently changed (e.g. OS packages, dependencies) to most frequently changed (application source code)?',
                        'type': 'multiple_choice',
                        'options': [
                            'Docker ignores files added after the WORKDIR instruction',
                            'To maximize Docker layer cache hits and drastically accelerate rebuild times',
                            'It is required by the OCI (Open Container Initiative) standard',
                            'To prevent containers from accessing environment variables'
                        ],
                        'correct_option_index': 1,
                        'explanation': 'Docker caches image layers sequentially. Modifying an early step invalidates the cache for all subsequent steps.'
                    }
                ]
            },
            {
                'title': 'System Design & Scalability Architecture Assessment',
                'slug': 'system-design-scalability',
                'skill_name': 'System Design',
                'assessment_type': 'scenario',
                'difficulty': 'Advanced',
                'time_limit_minutes': 30,
                'passing_score': 70.0,
                'description': 'Evaluates distributed system architectures, horizontal scaling, caching strategies (Redis), message queues (Kafka/RabbitMQ), and database partitioning.',
                'evaluation_rubric': 'Assesses understanding of CAP theorem trade-offs, caching invalidation, asynchronous decoupling, and high availability design.',
                'questions': [
                    {
                        'id': 'sd-q1',
                        'prompt': 'In a system handling 100,000 read requests per second on user profiles with infrequent updates, which architectural pattern provides the most cost-effective scalability?',
                        'type': 'multiple_choice',
                        'options': [
                            'Add more primary database write replicas without caching',
                            'Introduce an in-memory distributed cache (e.g., Redis or Memcached) with a cache-aside pattern and read replicas',
                            'Store all user profiles directly in flat CSV files on local web server disks',
                            'Switch from TCP/IP to UDP network protocols'
                        ],
                        'correct_option_index': 1,
                        'explanation': 'For read-heavy workloads (e.g., 99:1 read:write ratio), distributed in-memory caching absorbs over 90% of database queries, drastically reducing latency and database load.'
                    },
                    {
                        'id': 'sd-q2',
                        'prompt': 'Explain how an asynchronous message broker (like Apache Kafka or RabbitMQ) prevents cascading system failures during sudden traffic spikes.',
                        'type': 'scenario',
                        'key_concepts': ['decoupling', 'buffer', 'queue', 'rate', 'backpressure', 'worker'],
                        'explanation': 'Message queues decouple producer services from downstream consumers, buffering sudden traffic bursts and allowing workers to process tasks at a sustained, safe throughput rate.'
                    },
                    {
                        'id': 'sd-q3',
                        'prompt': 'What is the trade-off described by the CAP Theorem for distributed data stores in the presence of a network partition (P)?',
                        'type': 'multiple_choice',
                        'options': [
                            'You must choose between zero downtime or lower hardware cost',
                            'You must choose between Consistency (all nodes see same data) or Availability (every non-failing node returns a response)',
                            'You can guarantee both Consistency and Availability without compromise if using SSD storage',
                            'Network partitions only occur in relational databases'
                        ],
                        'correct_option_index': 1,
                        'explanation': 'The CAP theorem proves that in the event of a network partition between distributed nodes, a system must decide between returning consistent data (CP) or remaining available (AP).'
                    }
                ]
            }
        ]

        created_count = 0
        updated_count = 0

        for a_data in assessments_data:
            slug = a_data['slug']
            obj, created = SkillAssessment.objects.update_or_create(
                slug=slug,
                defaults=a_data
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded Skill Assessments: {created_count} created, {updated_count} updated."
        ))
