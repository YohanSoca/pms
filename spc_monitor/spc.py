import threading
import time
import serial
import minimalmodbus
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


class SPC:
    def __init__(self):
        self.spc_node = None
        self.spc_baud_rate = None
        self.spc_parity = None
        self.spc_stopbits = None
        self.spc_address = None
        self.spc_connected = False
        self.spc_errors_downloaded = False
        self.spc_data_downloaded = False


        # Payload
        self.spc_parameters = []
        self.error_container = []

        # Load database
        self.input_parsed_data = []
        self.output_parsed_data = []
        self.code_errors = []
        self.in_file_db_path = 'input_error_code.txt'
        self.out_file_db_path = 'output_error_code.txt'
        self.input_db = self.load_error_db(self.in_file_db_path, self.input_parsed_data)
        self.output_db  = self.load_error_db(self.out_file_db_path, self.output_parsed_data)

    def download_data(self):
        threading.Thread(target=self.get_spc_data).start()

    def get_spc_data(self):
        while not self.spc_data_downloaded:
            if self.spc_connected:
                for reg in range(4096, 4220):
                    try:
                        val = self.spc_node.read_register(reg)
                        data = {f"{reg}": val}
                        self.spc_parameters.append(data)
                    except:
                        pass
            self.spc_data_downloaded = True
            threading.Thread(target=self.get_log_error).start()


    def get_log_error(self):
        while True:
            if self.spc_connected:
                for error_pointer in range(1, 256):
                    try:
                        self.spc_node.write_register(6, error_pointer)
                        val = self.spc_node.read_register(4138)
                        self.error_container.append({f"{error_pointer}": val})
                    except:
                        pass

    def find_spc_settings(self):
        baud_rates = [19200, 9600, 38400]
        parities = [serial.PARITY_EVEN, serial.PARITY_NONE, serial.PARITY_ODD]
        stop_bits = [1, 2]
        for baud_rate in baud_rates:
            for parity in parities:
                for stop_bit in stop_bits:
                    for node_id in range(1, 10):
                        spc = minimalmodbus.Instrument('COM4', node_id)
                        spc.serial.baudrate = baud_rate
                        spc.serial.bytesize = 8
                        spc.serial.parity = parity
                        spc.serial.stopbits = stop_bit
                        spc.serial.timeout = 0.05  # seconds
                        spc.mode = minimalmodbus.MODE_RTU  # rtu or ascii mode
                        spc.clear_buffers_before_each_transaction = True

                        counts = 0
                        try:
                            for reg in range(0, 6):
                                print(f"{baud_rate}, {parity}, {stop_bit}, {node_id}, {reg}")
                                spc.read_registers(reg, 1)
                                self.spc_address = id
                                self.spc_baud_rate = baud_rate
                                self.spc_parity = parity
                                self.spc_stopbits = stop_bit
                                self.spc_node = spc
                                return
                        except:
                            pass

    def connect(self):
        while not self.spc_connected:
            try:
                self.find_spc_settings()
                self.spc_node = minimalmodbus.Instrument('COM4', self.spc_address)
                self.spc_connected = True
            except:
                pass

    def upload_file(self):
        pass

    def parser_register_value(self, value):
        if value == 0:
            return {
                'input_error': 0,
                'output_error': 0
            }

        hex_value = hex(value)[2:]

        if len(hex_value) < 4 and len(hex_value) > 2:
            hex_value = '0' + str(hex_value)

        if len(hex_value) < 3 and len(hex_value) > 1:
            hex_value = '0' + hex_value[:1] + '0' + hex_value[1:]

        input_error = int(hex_value[:2], 16)
        output_error = int(hex_value[2:], 16)

        return {
            'input_error': input_error,
            'output_error': output_error
        }

    def load_error_db(self, db_file, parsed_data):
        
        with open(os.path.join(BASE_DIR, f"{db_file}"), 'r') as reader:
            line = reader.readline()

            try:
                while line != '':  # The EOF char is an empty string
                    temp = {}
                    error_code = None
                    try:
                        codes = line.split('#')[0].split(',')
                        desc = line.split('#')[1]
                        cause = line.split('#')[2]
                    except:
                        pass

                    for code in range(0, len(codes)):

                        try:
                            error_code = {
                                'code': int(codes[code]),
                                'description': desc,
                                'cause': cause
                            }
                        except:
                            pass
                        if error_code:
                            parsed_data.append(error_code)
                            
                    line = reader.readline()
            except:
                pass


    def find_error(self, error_code, file_db):
        target = list(filter(lambda d: d['code'] in error_code, file_db))
        return target

