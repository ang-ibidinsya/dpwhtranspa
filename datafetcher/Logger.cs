namespace DataFetcher;

public class Logger
{
    public static void Log(string message)
    {
        Console.WriteLine($"[{DateTime.Now:yyyy-MMM-dd⏰HH:mm:ss.fff}] {message}");
    }

    public static void Green(string message)
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Log(message);
        Console.ForegroundColor = ConsoleColor.White;
    }
}