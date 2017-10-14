# The example is compiled out of the following open source files:
# - sandpiles/sandpiles.py (https://github.com/selectnull/sandpiles/blob/2a5e0b922ef0d8c1884971d7ab9cb08890b56b9c/sandpiles.py)

import copy


class Sandpile(object):
    """ Sandpile is cellular automaton based on
        https://www.youtube.com/watch?v=1MtEUErz7Gg
    """
    def __init__(self, data=None, size=None):
        if data is None and size is None:
            raise ValueError('Both data and size can not be None.')

        if data and not size:
            if not self._is_valid_data(data):
                raise ValueError('Data is not shaped correctly.')
            self.size = len(data)
            self.data = data

        if size is not None and data is None:
            if size <= 0:
                raise ValueError('Size must be an integer larger than 0.')
            self.size = size
            self.data = self.fill_zeros(size)

        if size and data:
            if not self._is_valid_data(data):
                raise ValueError('Data is not shaped correctly.')
            if size != len(data):
                raise ValueError('Data shape and size do not match.')
            self.size = size
            self.data = data

    def fill_zeros(self, size):
        result = []
        for x in range(size):
            result.append([0 for y in range(size)])
        return result

    @staticmethod
    def _is_valid_value(value):
        try:
            return 0 <= value <= 3
        except TypeError:
            return False

    @staticmethod
    def _is_valid_data(data):
        """Check that data is valid.

        It must be an iterable of iterables and all inner iterables
        are the same size as the outter one.
        """
        lx = len(data)
        if not all([len(y) == lx for y in data]):
            return False
        return True

    def is_valid(self):
        if not self._is_valid_data(self.data):
            return False
        return all(self._is_valid_value(x) for l in self.data for x in l)

    def neighbours(self, x, y):
        """Return a list of neighbours' positions for cell (x, y)."""
        s = self.size - 1
        result = []
        for nx in range(x-1, x+2):
            for ny in range(y-1, y+2):
                if (nx == x) and (ny == y):  # skip itself
                    continue
                if (0 <= nx <= s) and (0 <= ny <= s):
                    if (nx == x) or (ny == y):
                        result.append((nx, ny))
                ny += 1
            nx += 1
        return result

    def topple(self):
        """Topple the cells that have more sand than allowed."""
        step = self
        while not self.is_valid():
            # calculate delta which is initialized with zero values
            delta = Sandpile(size=self.size)
            for x, vx in enumerate(self.data):
                for y, vy in enumerate(vx):
                    if not self._is_valid_value(vy):
                        self.data[x][y] -= 4
                        for nx, ny in self.neighbours(x, y):
                            delta.data[nx][ny] += 1
            # apply delta
            for x, vx in enumerate(self.data):
                for y, vy in enumerate(vx):
                    self.data[x][y] += delta.data[x][y]
        return self

    def __str__(self):
        s = ''
        for x in self.data:
            s += ' '.join(str(y) for y in x) + '\n'
        return s

    def __add__(self, other):
        first = Sandpile(data=copy.deepcopy(self.data))
        if first.size != other.size:
            raise ValueError('Sandpile sizes must match.')

        for x, vx in enumerate(first.data):
            for y, vy in enumerate(vx):
                first.data[x][y] += other.data[x][y]
        return first.topple()
