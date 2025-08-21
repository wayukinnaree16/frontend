// Test script to validate the wishlist update logic
// This can be run in the browser console to test the validation

function testWishlistValidation() {
  console.log('Testing wishlist validation logic...');
  
  // Test cases
  const testCases = [
    {
      name: 'Valid data',
      data: {
        item_name: 'Test Item',
        description_detail: 'Test description',
        quantity_needed: 5,
        quantity_unit: 'pieces',
        category_id: 1,
        urgency_level: 'normal'
      },
      shouldPass: true
    },
    {
      name: 'Item name too long',
      data: {
        item_name: 'a'.repeat(256), // 256 characters
        description_detail: 'Test description',
        quantity_needed: 5,
        quantity_unit: 'pieces',
        category_id: 1,
        urgency_level: 'normal'
      },
      shouldPass: false
    },
    {
      name: 'Invalid quantity',
      data: {
        item_name: 'Test Item',
        description_detail: 'Test description',
        quantity_needed: -1,
        quantity_unit: 'pieces',
        category_id: 1,
        urgency_level: 'normal'
      },
      shouldPass: false
    },
    {
      name: 'Invalid urgency level',
      data: {
        item_name: 'Test Item',
        description_detail: 'Test description',
        quantity_needed: 5,
        quantity_unit: 'pieces',
        category_id: 1,
        urgency_level: 'invalid_level'
      },
      shouldPass: false
    }
  ];
  
  // Validation function (copied from the component)
  function validateData(updatedData) {
    const validationErrors = [];
    
    if (updatedData.item_name && updatedData.item_name.length > 255) {
      validationErrors.push('ชื่อรายการต้องไม่เกิน 255 ตัวอักษร');
    }
    
    if (updatedData.quantity_needed && (updatedData.quantity_needed <= 0 || !Number.isInteger(updatedData.quantity_needed))) {
      validationErrors.push('จำนวนที่ต้องการต้องเป็นจำนวนเต็มบวก');
    }
    
    if (updatedData.quantity_unit && updatedData.quantity_unit.length > 50) {
      validationErrors.push('หน่วยนับต้องไม่เกิน 50 ตัวอักษร');
    }
    
    if (updatedData.category_id && (updatedData.category_id <= 0 || !Number.isInteger(updatedData.category_id))) {
      validationErrors.push('กรุณาเลือกหมวดหมู่ที่ถูกต้อง');
    }
    
    if (updatedData.urgency_level && !['normal', 'urgent', 'very_urgent', 'extremely_urgent'].includes(updatedData.urgency_level)) {
      validationErrors.push('ระดับความเร่งด่วนไม่ถูกต้อง');
    }
    
    return validationErrors;
  }
  
  // Run tests
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    const errors = validateData(testCase.data);
    const hasErrors = errors.length > 0;
    const testPassed = testCase.shouldPass ? !hasErrors : hasErrors;
    
    if (testPassed) {
      console.log(`✅ ${testCase.name}: PASSED`);
      passed++;
    } else {
      console.log(`❌ ${testCase.name}: FAILED`);
      console.log(`   Expected: ${testCase.shouldPass ? 'no errors' : 'errors'}`);
      console.log(`   Got: ${hasErrors ? 'errors' : 'no errors'}`);
      if (hasErrors) {
        console.log(`   Errors: ${errors.join(', ')}`);
      }
      failed++;
    }
  });
  
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

// Run the test
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('Run testWishlistValidation() in the console to test validation');
} else {
  // Node.js environment
  testWishlistValidation();
}