#include <iostream>
#include <vector>
#include <list> // Using std::list for adjacency list

class Graph {
private:
    int V; // Number of vertices
    std::vector<std::list<int>> adj; // Adjacency list

    // Recursive helper function for DFS traversal
    void DFSUtil(int v, std::vector<bool>& visited) {
        // Mark the current node as visited and print it
        visited[v] = true;
        std::cout << v << " ";

        // Recur for all the vertices adjacent to this vertex
        for (int neighbor : adj[v]) {
            if (!visited[neighbor]) {
                DFSUtil(neighbor, visited); // Recursive call for unvisited neighbors
            }
        }
    }

public:
    // Constructor to initialize the graph with V vertices
    Graph(int V) {
        this->V = V;
        adj.resize(V);
    }

    // Function to add an edge to the graph (undirected)
    void addEdge(int v, int w) {
        adj[v].push_back(w);
        adj[w].push_back(v); // For undirected graph
    }

    // Main DFS function to start the traversal from a given vertex
    void DFS(int startNode) {
        // Mark all vertices as not visited initially
        std::vector<bool> visited(V, false);

        // Call the recursive helper function
        DFSUtil(startNode, visited);
    }
};

int main() {
    // Create a graph with 5 vertices
    Graph g(5);

    // Add edges
    g.addEdge(0, 1);
    g.addEdge(0, 2);
    g.addEdge(1, 3);
    g.addEdge(2, 4);
    g.addEdge(3, 4);

    std::cout << "Depth First Traversal (starting from vertex 0): ";
    g.DFS(0);
    std::cout << std::endl;

    return 0;
}