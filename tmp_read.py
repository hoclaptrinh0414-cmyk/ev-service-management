import pathlib,sys 
data=pathlib.Path('src/pages/staff/Settings.jsx').read_bytes() 
sys.stdout.buffer.write(data) 
