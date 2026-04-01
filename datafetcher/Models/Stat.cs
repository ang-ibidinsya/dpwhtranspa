using System.ComponentModel.DataAnnotations;

namespace DataFetcher;

public class Stats
{    
    public required string code { get; set; }

    public required StatsData data { get; set; }
}

public class StatsData
{
        public int completedProjects { get; set; }
        public int totalProjects { get; set; }
}