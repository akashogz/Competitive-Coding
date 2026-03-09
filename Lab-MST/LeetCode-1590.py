class Solution:
    def minSubarray(self, nums, p):
        total = sum(nums)
        target = total % p
        
        if target == 0:
            return 0
        
        prefix = 0
        res = len(nums)
        seen = {0: -1}
        
        for i, num in enumerate(nums):
            prefix = (prefix + num) % p
            
            need = (prefix - target) % p
            
            if need in seen:
                res = min(res, i - seen[need])
            
            seen[prefix] = i
        
        return res if res < len(nums) else -1