using System.Text;
using DataPreparer;

// See https://aka.ms/new-console-template for more information
Console.WriteLine("Start Data Preparer");
Console.OutputEncoding = Encoding.UTF8;
#if true
DataManager mgr = new ("../datafetcher/Results_2026-09-11/");
mgr.PrepareData();
#else
Categorizer categorizer = new Categorizer("masterData.json", "compactJson.json");
categorizer.Start();
#endif

Console.WriteLine("Finished!");
