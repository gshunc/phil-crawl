# PhilTreeCrawler: Vision and Concept

## Overview
PhilTreeCrawler is designed to be a "living" map of human thought. Instead of a static encyclopedia, it provides a dynamic, path-dependent journey through philosophy. The core experience revolves around moving from node to node (concept to concept) in an ever-expanding graph.

## Core Mechanics

### 1. Node Interaction
When a user "arrives" at a philosophical concept (a node):
- **Lesson Retrieval/Generation**: The system checks if a lesson already exists for this concept. If not, it uses generative AI to create a clear, engaging lesson based on the current context of the user's journey.
- **Content Storage**: Every generated lesson is saved, ensuring that the collective "PhilTree" grows more detailed over time.

### 2. Branching and Traversal
From each concept, several "branches" (connections to other concepts) are presented:
- **Relational Context**: Each branch is not just a link but includes a description of *how* the new concept relates to the current one (e.g., "Socrates' ethics leads to Plato's Theory of Forms via the search for universal definitions").
- **User Choice**: Users choose which path to follow, influencing which parts of the graph are expanded next.

### 3. Graph Evolution
The graph is not pre-defined in its entirety. It grows procedurally:
- **Discovery**: As users choose new branches, those nodes and their connections are formalized in the database.
- **Persistence**: The results of all interactions are stored, allowing the graph to serve as a shared resource for all explorers.

## Technical Goals
- **Graph Database**: Efficiently store nodes and edges representing philosophical relationships.
- **LLM Integration**: For high-quality, contextual lesson generation.
- **Frontend Visualization**: An intuitive way to see the "tree" growing and navigate its branches.

