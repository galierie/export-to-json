from os.path import dirname, join
from json import loads


def split_to_indiv_files(f_name: str):
    actual_path = dirname(__file__)
    data_path = join(actual_path, './data')

    with open(join(data_path, f'./{f_name}')) as f:
        raw_json = f.read()
        parsed_json = loads(raw_json)

        for obj in parsed_json:
            if 'file_name' in obj:
                new_f_name = obj['file_name']
                obj.pop('file_name')

                stringified = str(obj).replace('\'', '\"')
                with open(join(data_path, f'./{new_f_name}.json'), 'w') as new_f:
                    new_f.write(stringified)

# split_to_indiv_files('')