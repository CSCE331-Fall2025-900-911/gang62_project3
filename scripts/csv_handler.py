import os
import csv


def write_csv(out_dir: os.path, data: list[list], headers: list[str]=None) -> None:
    """
    Write a list to a csv file
    
    Args:
        out_dir (Path) : The file path to write the csv to (.csv included)
        data (2D list) : A list of rows to write to file
        headers (list) : A list containing headers. No headers in csv if none are provided.  
    """    

    with open(out_dir, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        if headers:
            writer.writerow(headers)
        writer.writerows(data)


def read_csv(source_dir: os.path) -> list:
    """
    Read a csv file as a list
    
    Args:
        source_dir (Path) : The path to the csv file to read
    """    

    data = []
    with open(source_dir, 'r', newline='') as file:
        csv_reader = csv.reader(file)
        for row in csv_reader:
            data.append(row)

    return data