import sys
input = sys.stdin.readline

t = int(input())

for _ in range(t):
    n = int(input())

    if n > 4:
        print(1, 3, end=" ")
        for i in range(7, n+1, 2):
            print(i, end=" ")

        print(5, 4, 2, end=" ")
        for i in range(6, n+1, 2):
            print(i, end=" ")

    else:
        print(-1)