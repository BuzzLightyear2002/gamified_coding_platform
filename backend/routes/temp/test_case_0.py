def climbStairs(num):
    a = 1
    b = 1
    n = num - 1
    for i in range(n):
        c = a
        a = a + b
        b = c
    return a
print(climbStairs(2))