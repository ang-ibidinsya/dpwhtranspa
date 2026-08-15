using System.IO.Compression;

namespace DataPreparer;

public class Utils
{
    public static readonly DateTime MiddleValue = new DateTime(2020, 1, 1);

    public static int? GetDateValue(DateTime? dt)
    {
        if (!dt.HasValue)
        {
            return null;
        }

        return (int)(dt.Value - MiddleValue).TotalDays;
    }

    public static void GzipData(string data, string filename)
    {
        using (var fileStream = File.Create(filename))
        using (var gzipStream = new GZipStream(fileStream, CompressionMode.Compress))
        using (var writer = new StreamWriter(gzipStream))
        {
            writer.Write(data);
        }
    }
}
