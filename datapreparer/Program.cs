using System.Text;
using DataPreparer;

// See https://aka.ms/new-console-template for more information
Console.WriteLine("Start Data Preparer");
Console.OutputEncoding = Encoding.UTF8;
//DataManager mgr = new ("../datafetcher/Results_2025-12-07/");
//mgr.PrepareData();
Categorizer categorizer = new Categorizer("masterData.json", "compactJson.json");
categorizer.Start();

Console.WriteLine("Finished!");
