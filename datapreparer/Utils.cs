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
}
