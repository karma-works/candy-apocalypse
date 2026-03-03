import os
import struct

def pack_string(s, length=8):
    return s.encode('ascii').ljust(length, b'\x00')

def write_wad(filename, lumps):
    # Calculate offsets
    header_size = 12
    dir_entry_size = 16
    
    # Write lumps data
    lumps_data = b''
    directory = []
    
    offset = header_size
    for name, data in lumps:
        size = len(data)
        directory.append((offset, size, name))
        lumps_data += data
        offset += size
        
    dir_offset = offset
    
    # Write directory
    dir_data = b''
    for off, size, name in directory:
        dir_data += struct.pack('<ii8s', off, size, pack_string(name))
        
    # Write header
    header = struct.pack('<4sii', b'PWAD', len(lumps), dir_offset)
    
    with open(filename, 'wb') as f:
        f.write(header)
        f.write(lumps_data)
        f.write(dir_data)

def create_single_cube():
    # 1. THINGS: 1 player start
    # x, y, angle, type, flags
    things = struct.pack('<hhHhH', 64, 64, 90, 1, 7)
    
    # 2. VERTEXES: 4 corners of a 128x128 room
    vertexes = b''.join([
        struct.pack('<hh', 0, 0),     # 0
        struct.pack('<hh', 128, 0),   # 1
        struct.pack('<hh', 128, 128), # 2
        struct.pack('<hh', 0, 128)    # 3
    ])
    
    # 3. SECTORS: 1 sector
    # floorHeight, ceilHeight, floorTex(8), ceilTex(8), light, type, tag
    sectors = struct.pack('<hh8s8shhh', 
        0, 128, b'FLOOR0_1', b'CEIL1_1', 255, 0, 0)
        
    # 4. SIDEDEFS: 4 sides
    # xoffset, yoffset, upper(8), lower(8), middle(8), sector
    sidedefs = b''.join([
        struct.pack('<hh8s8s8sh', 0, 0, b'-', b'-', b'STARTAN', 0),
        struct.pack('<hh8s8s8sh', 0, 0, b'-', b'-', b'STARTAN', 0),
        struct.pack('<hh8s8s8sh', 0, 0, b'-', b'-', b'STARTAN', 0),
        struct.pack('<hh8s8s8sh', 0, 0, b'-', b'-', b'STARTAN', 0),
    ])
    
    # 5. LINEDEFS: 4 lines
    # v1, v2, flags, type, tag, right_side, left_side
    # flags: 1 = block players
    linedefs = b''.join([
        struct.pack('<hhHhhHH', 0, 1, 1, 0, 0, 0, 0xFFFF),
        struct.pack('<hhHhhHH', 1, 2, 1, 0, 0, 1, 0xFFFF),
        struct.pack('<hhHhhHH', 2, 3, 1, 0, 0, 2, 0xFFFF),
        struct.pack('<hhHhhHH', 3, 0, 1, 0, 0, 3, 0xFFFF),
    ])
    
    # 6. SEGS: 4 sub-segments (matches linedefs since no BSP split)
    # v1, v2, angle, linedef, side, offset
    # angles: 0, 90, 180, -90 degrees in BAMs (0, 16384, -32768, -16384)
    segs = b''.join([
        struct.pack('<hhhhhh', 0, 1, 0, 0, 0, 0),
        struct.pack('<hhhhhh', 1, 2, 16384, 1, 0, 0),
        struct.pack('<hhhhhh', 2, 3, -32768, 2, 0, 0),
        struct.pack('<hhhhhh', 3, 0, -16384, 3, 0, 0),
    ])
    
    # 7. SSECTORS: 1 subsector
    # num_segs, first_seg
    ssectors = struct.pack('<hh', 4, 0)
    
    # 8. NODES: 0 nodes
    nodes = b''
    
    # 9. REJECT: 1 byte for 1 sector (rounded up to bytes?)
    # actually size = (num_sectors * num_sectors + 7) / 8
    reject = b'\x00'
    
    # 10. BLOCKMAP
    # originX, originY, columns, rows
    # followed by blocklists. Min blockmap: 4 header words + 1 blocklist with terminator (0xFFFF)
    # offset to blocklist is from start of blockmap
    # size = 4 words header. So offset is 8 bytes (4 words) -> wait, offset is in words! So 4.
    # actually, with 1 column and 1 row:
    # 4 words header
    # 1 word offset to block (value = 5)
    # 1 word block separator (0)
    # 1 word block terminator (-1)
    blockmap = struct.pack('<hhhhhhH',
        0, 0,  # X, Y origin
        1, 1,  # 1 col, 1 row
        5,     # offset to block 0 (word 5)
        0,     # block separator
        0xFFFF # terminator
    )
    
    lumps = [
        ('E1M1', b''),
        ('THINGS', things),
        ('LINEDEFS', linedefs),
        ('SIDEDEFS', sidedefs),
        ('VERTEXES', vertexes),
        ('SEGS', segs),
        ('SSECTORS', ssectors),
        ('NODES', nodes),
        ('SECTORS', sectors),
        ('REJECT', reject),
        ('BLOCKMAP', blockmap)
    ]
    
    os.makedirs('tests/fixtures/wads', exist_ok=True)
    write_wad('tests/fixtures/wads/single-cube.wad', lumps)

create_single_cube()
print("Wrote tests/fixtures/wads/single-cube.wad")
