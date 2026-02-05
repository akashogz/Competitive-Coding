import sys
input = sys.stdin.readline

divCount = [0] * (10**6 + 1)

for i in range(1, 10**6 + 1):
    for j in range(i, 10**6 + 1, i):
        divCount[j] += 1

n = int(input())
for _ in range(n):
    x = int(input())
    print(divCount[x])