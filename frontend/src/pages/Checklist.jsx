// src/pages/Checklist.jsx

import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  FormGroup, 
  FormControlLabel, 
  Checkbox, 
  LinearProgress, 
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import DescriptionIcon from '@mui/icons-material/Description';
import SpeedIcon from '@mui/icons-material/Speed';
import PageHeader from '../components/common/PageHeader';
import { toggleChecklistItem } from '../features/checklist/checklistSlice';

const Checklist = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.checklist);
  const [expandedItem, setExpandedItem] = useState(null);

  const handleToggle = (id) => {
    dispatch(toggleChecklistItem(id));
  };

  const handleAccordionChange = (itemId) => (event, isExpanded) => {
    setExpandedItem(isExpanded ? itemId : null);
  };

  const categories = useMemo(() => 
    [...new Set(items.map(item => item.category))]
  , [items]);

  const completionRate = useMemo(() => 
    (items.filter(item => item.checked).length / items.length) * 100
  , [items]);

  const getCategoryCompletion = (category) => {
    const categoryItems = items.filter(item => item.category === category);
    const completed = categoryItems.filter(item => item.checked).length;
    return ((completed / categoryItems.length) * 100).toFixed(0);
  };

  const renderDetailSection = (title, content, icon) => {
    if (!content) return null;
    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {icon}
          <Typography variant="subtitle2" fontWeight="bold" color="primary">
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', pl: 4 }}>
          {content}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <PageHeader
        title="System Checklist"
        subtitle="Pre-operational and routine maintenance checks for IGT-12MW Gas Turbine Compressor"
      />
      
      {/* Overall Progress */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" color="white" fontWeight="bold">
            Overall Completion: {completionRate.toFixed(0)}%
          </Typography>
          <Typography variant="h6" color="white">
            {items.filter(item => item.checked).length} / {items.length} Items Complete
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={completionRate} 
          sx={{ 
            height: 12, 
            borderRadius: 6,
            backgroundColor: 'rgba(255,255,255,0.3)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#4caf50',
              borderRadius: 6
            }
          }} 
        />
      </Paper>

      {/* Category-based Checklist Items */}
      <Grid container spacing={3}>
        {categories.map(category => (
          <Grid item xs={12} key={category}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {category}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={`${getCategoryCompletion(category)}% Complete`}
                    color={getCategoryCompletion(category) === '100' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
              </Box>
              
              <FormGroup>
                {items.filter(item => item.category === category).map(item => (
                  <Accordion 
                    key={item.id}
                    expanded={expandedItem === item.id}
                    onChange={handleAccordionChange(item.id)}
                    sx={{ 
                      mb: 1,
                      '&:before': { display: 'none' },
                      boxShadow: expandedItem === item.id ? 3 : 1
                    }}
                  >
                    <AccordionSummary 
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ 
                        backgroundColor: item.checked ? '#e8f5e9' : '#fff3e0',
                        '&:hover': { backgroundColor: item.checked ? '#c8e6c9' : '#ffe0b2' }
                      }}
                    >
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            checked={item.checked} 
                            onChange={() => handleToggle(item.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        } 
                        label={
                          <Box>
                            <Typography 
                              variant="body1" 
                              fontWeight="bold"
                              sx={{ 
                                textDecoration: item.checked ? 'line-through' : 'none',
                                color: item.checked ? 'text.secondary' : 'text.primary'
                              }}
                            >
                              {item.text}
                            </Typography>
                            {item.frequency && (
                              <Chip 
                                label={item.frequency} 
                                size="small" 
                                icon={<SpeedIcon />}
                                sx={{ mt: 0.5 }}
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        sx={{ flex: 1, mr: 2 }}
                      />
                    </AccordionSummary>
                    
                    <AccordionDetails sx={{ backgroundColor: '#fafafa' }}>
                      {/* Description */}
                      {renderDetailSection(
                        'Description',
                        item.description,
                        <InfoIcon fontSize="small" color="primary" />
                      )}

                      {/* Details */}
                      {renderDetailSection(
                        'Details',
                        item.details,
                        <DescriptionIcon fontSize="small" color="info" />
                      )}

                      {/* Acceptance Criteria */}
                      {item.acceptanceCriteria && (
                        <Box sx={{ mb: 2 }}>
                          <Alert severity="success" icon={false}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Acceptance Criteria
                            </Typography>
                            <Typography variant="body2">
                              {item.acceptanceCriteria}
                            </Typography>
                          </Alert>
                        </Box>
                      )}

                      {/* Critical Note */}
                      {item.criticalNote && (
                        <Box sx={{ mb: 2 }}>
                          <Alert severity="error" icon={<WarningIcon />}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Critical Note
                            </Typography>
                            <Typography variant="body2">
                              {item.criticalNote}
                            </Typography>
                          </Alert>
                        </Box>
                      )}

                      <Divider sx={{ my: 2 }} />

                      {/* Procedure */}
                      {item.procedure && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                            Procedure
                          </Typography>
                          <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#fff' }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                              {item.procedure}
                            </Typography>
                          </Paper>
                        </Box>
                      )}

                      {/* Technical Specifications */}
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {item.normalRange && (
                          <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Normal Range
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {item.normalRange}
                              </Typography>
                            </Paper>
                          </Grid>
                        )}
                        
                        {item.alarmLimits && (
                          <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#ffebee' }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Alarm Limits
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {item.alarmLimits}
                              </Typography>
                            </Paper>
                          </Grid>
                        )}

                        {item.equipment && (
                          <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f3e5f5' }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Required Equipment
                              </Typography>
                              <Typography variant="body2">
                                {item.equipment}
                              </Typography>
                            </Paper>
                          </Grid>
                        )}

                        {item.reference && (
                          <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#fff3e0' }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Reference
                              </Typography>
                              <Typography variant="body2">
                                {item.reference}
                              </Typography>
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </FormGroup>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Submit Button */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          color={completionRate === 100 ? 'success' : 'primary'}
          size="large"
          disabled={completionRate < 100}
          sx={{ minWidth: 250, py: 1.5 }}
        >
          {completionRate === 100 ? "✓ All Checks Complete - Submit Report" : `Complete Remaining ${items.filter(item => !item.checked).length} Items`}
        </Button>
      </Box>
    </Box>
  );
};

export default Checklist;