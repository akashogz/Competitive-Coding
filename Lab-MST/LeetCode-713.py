class Solution:
    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:
        if k <= 1:
            return 0

        res = 0
        l = 0
        pro = 1

        for r in range(0, len(nums)):
            pro *= nums[r]

            while pro >= k:
                pro //= nums[l]
                l += 1

            res += (r - l) + 1
    
        return res