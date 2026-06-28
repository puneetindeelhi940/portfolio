(function () {
  'use strict';

  const DATA_BASE = 'data/';
  let globalIndex = null;
  let countries = null;
  let products = null;
  let subscriptions = null;

  async function loadJSON(file) {
    const r = await fetch(DATA_BASE + file);
    if (!r.ok) throw new Error('Failed to load ' + file);
    return r.json();
  }

  async function init() {
    try {
      [globalIndex, countries, products, subscriptions] = await Promise.all([
        loadJSON('global-index.json'),
        loadJSON('countries.json'),
        loadJSON('products.json'),
        loadJSON('ai-subscriptions.json')
      ]);
      renderRefreshBadge();
      renderHero();
      renderMap();
      renderCountries();
      renderProducts('direct');
      renderCausalSelector();
      renderSubscriptions();
      renderCalculatorCountries();
      renderEnergy();
      setupNav();
      setupFilters();
      setupCalculator();
      document.getElementById('footerYear').textContent = new Date().getFullYear();
      initTicker();
    } catch (e) {
      console.error('Observatory init error:', e);
    }
  }

  // ═══════════════ REFRESH BADGE ═══════════════
  function renderRefreshBadge() {
    const el = document.getElementById('refreshTime');
    const ts = globalIndex.last_updated || globalIndex.composite_index?.period;
    if (!ts) { el.textContent = 'No data'; return; }
    try {
      const d = new Date(ts);
      el.textContent = 'Last refresh: ' + d.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
      });
    } catch (_) {
      el.textContent = 'Last refresh: ' + ts;
    }
  }

  // ═══════════════ HERO ═══════════════
  function renderHero() {
    const ci = globalIndex.composite_index;
    animateNumber('heroNumber', ci.current_value, 1);
    const trend = document.getElementById('heroTrend');
    trend.textContent = ci.trend === 'rising' ? '↑' : ci.trend === 'falling' ? '↓' : '→';
    trend.className = 'hero__trend' + (ci.trend === 'falling' ? ' down' : '');
    document.getElementById('heroSub').textContent = ci.description;

    const metricsEl = document.getElementById('heroMetrics');
    metricsEl.innerHTML = globalIndex.headline_metrics.map(function (m) {
      var changeClass = m.change.startsWith('+') ? 'up' : m.change.startsWith('-') ? 'down' : '';
      return '<div class="metric__card">' +
        '<div class="metric__label">' + esc(m.label) + '</div>' +
        '<div class="metric__value">' + esc(m.value) + '</div>' +
        '<div class="metric__change ' + changeClass + '">' + esc(m.change) + ' ' + esc(m.period) + '</div>' +
        '<div class="metric__source">' + esc(m.source) + '</div>' +
        '</div>';
    }).join('');

    var comps = globalIndex.components;
    var compEl = document.getElementById('heroComponents');
    compEl.innerHTML = Object.keys(comps).map(function (k) {
      var c = comps[k];
      var cls = c.value >= 8 ? 'high' : c.value >= 4 ? 'moderate' : 'low';
      var barColor = c.value >= 8 ? 'var(--red)' : c.value >= 4 ? 'var(--orange)' : 'var(--green)';
      var pct = Math.min(c.value / 15 * 100, 100);
      return '<div class="component__card">' +
        '<div class="component__header">' +
        '<span class="component__name">' + esc(c.label) + '</span>' +
        '<span class="component__value ' + cls + '">' + c.value.toFixed(1) + '%</span>' +
        '</div>' +
        '<div class="component__bar"><div class="component__fill" style="width:' + pct + '%;background:' + barColor + '"></div></div>' +
        '<div class="component__weight">Weight: ' + (c.weight * 100) + '% · Trend: ' + esc(c.trend) + '</div>' +
        '<div class="component__drivers">' + c.drivers.join(' · ') + '</div>' +
        '</div>';
    }).join('');
  }

  function animateNumber(id, target, decimals) {
    var el = document.getElementById(id);
    var start = 0;
    var duration = 1200;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = (start + (target - start) * ease).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ═══════════════ MAP (vanilla JS, Natural Earth–ish projection) ═══════════════
  var iso2to3 = {
    US:'USA',CN:'CHN',IN:'IND',JP:'JPN',DE:'DEU',GB:'GBR',KR:'KOR',CA:'CAN',
    AU:'AUS',SG:'SGP',BR:'BRA',FR:'FRA',SE:'SWE',IL:'ISR',AE:'ARE',NL:'NLD',
    TW:'TWN',IE:'IRL',CH:'CHE',NO:'NOR',SA:'SAU',MX:'MEX',ID:'IDN',NG:'NGA',
    ZA:'ZAF',PL:'POL',MY:'MYS',KE:'KEN',AR:'ARG'
  };
  var iso3to2 = {};
  Object.keys(iso2to3).forEach(function (k) { iso3to2[iso2to3[k]] = k; });

  function projectMercator(lon, lat, w, h) {
    var x = (lon + 180) / 360 * w;
    var latR = lat * Math.PI / 180;
    var mercN = Math.log(Math.tan(Math.PI / 4 + latR / 2));
    var y = h / 2 - (mercN / Math.PI) * (h / 2);
    return [x, y];
  }

  function coordsToPath(coords, w, h) {
    return coords.map(function (ring) {
      return ring.map(function (pt, i) {
        var p = projectMercator(pt[0], pt[1], w, h);
        return (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1);
      }).join(' ') + ' Z';
    }).join(' ');
  }

  function featureToPath(feature, w, h) {
    var geom = feature.geometry;
    if (geom.type === 'Polygon') {
      return coordsToPath(geom.coordinates, w, h);
    } else if (geom.type === 'MultiPolygon') {
      return geom.coordinates.map(function (poly) {
        return coordsToPath(poly, w, h);
      }).join(' ');
    }
    return '';
  }

  function renderMap() {
    var wrap = document.getElementById('worldMap');
    var countryMap = {};
    countries.countries.forEach(function (c) { countryMap[c.code] = c; });

    var tooltip = document.createElement('div');
    tooltip.className = 'map__tooltip';
    tooltip.innerHTML = '<div class="map__tooltip__name"></div><div class="map__tooltip__score"></div>';
    document.body.appendChild(tooltip);

    fetch('../assets/world.json')
      .then(function (r) { return r.json(); })
      .then(function (geojson) {
        wrap.innerHTML = '';
        var W = 960, H = 500;

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'map__svg');
        svg.setAttribute('viewBox', '0 10 ' + W + ' ' + (H - 50));
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        geojson.features.forEach(function (feature) {
          if (!feature.geometry) return;
          if (feature.iso === 'ATA') return;
          var d = featureToPath(feature, W, H);
          if (!d) return;
          var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', d);

          var code2 = iso3to2[feature.iso];
          var cd = code2 ? countryMap[code2] : null;
          path.setAttribute('fill', cd ? scoreToColor(cd.ai_inflation_score) : '#E5E5EA');
          path.setAttribute('stroke', '#fff');
          path.setAttribute('stroke-width', '0.5');
          if (cd) path.style.cursor = 'pointer';

          path.addEventListener('mouseenter', function (e) {
            var name = cd ? cd.name : feature.name;
            tooltip.querySelector('.map__tooltip__name').textContent = name;
            tooltip.querySelector('.map__tooltip__score').textContent =
              cd ? 'AI Inflation Score: ' + cd.ai_inflation_score + '/100 · ' + cd.trend : 'No data available';
            tooltip.classList.add('visible');
            this.setAttribute('stroke', '#1D1D1F');
            this.setAttribute('stroke-width', '1.5');
            this.style.opacity = '0.85';
          });
          path.addEventListener('mousemove', function (e) {
            tooltip.style.left = (e.clientX + 14) + 'px';
            tooltip.style.top = (e.clientY - 44) + 'px';
          });
          path.addEventListener('mouseleave', function () {
            tooltip.classList.remove('visible');
            this.setAttribute('stroke', '#fff');
            this.setAttribute('stroke-width', '0.5');
            this.style.opacity = '1';
          });
          path.addEventListener('click', function () {
            if (cd) {
              showCountryDetail(cd);
              document.getElementById('country-section').scrollIntoView({ behavior: 'smooth' });
            }
          });
          svg.appendChild(path);
        });

        wrap.appendChild(svg);
      })
      .catch(function (err) {
        console.error('Map load error:', err);
        wrap.innerHTML = '<div class="map__loading">Map data unavailable</div>';
      });
  }

  function scoreToColor(score) {
    if (score >= 70) return '#D32F2F';
    if (score >= 55) return '#F57C00';
    if (score >= 40) return '#FBC02D';
    if (score >= 25) return '#1976D2';
    return '#388E3C';
  }

  // ═══════════════ COUNTRIES ═══════════════
  function renderCountries(list) {
    var data = list || countries.countries;
    var grid = document.getElementById('countryGrid');
    grid.innerHTML = data.map(function (c) {
      var scoreCls = c.ai_inflation_score >= 70 ? 'high' :
        c.ai_inflation_score >= 55 ? 'elevated' :
          c.ai_inflation_score >= 40 ? 'moderate' : 'low';
      var fillColor = scoreToColor(c.ai_inflation_score);
      return '<div class="country__card" data-code="' + c.code + '">' +
        '<div class="country__card__header">' +
        '<div><div class="country__card__name">' + esc(c.name) + '</div>' +
        '<div class="country__card__region">' + esc(c.region) + '</div></div>' +
        '<div class="country__card__score ' + scoreCls + '">' + c.ai_inflation_score + '</div>' +
        '</div>' +
        '<div class="country__card__bar"><div class="country__card__fill" style="width:' + c.ai_inflation_score + '%;background:' + fillColor + '"></div></div>' +
        '<div class="country__card__meta">' +
        '<span>CPI: ' + c.overall_cpi + '%</span>' +
        '<span>AI: +' + c.ai_contribution_ppt + 'ppt</span>' +
        '<span>Trend: ' + esc(c.trend) + '</span>' +
        '</div>' +
        '<span class="country__card__risk ' + c.risk_level + '">' + c.risk_level + ' risk</span>' +
        '</div>';
    }).join('');

    grid.querySelectorAll('.country__card').forEach(function (card) {
      card.addEventListener('click', function () {
        var code = this.getAttribute('data-code');
        var cd = countries.countries.find(function (c) { return c.code === code; });
        if (cd) showCountryDetail(cd);
      });
    });
  }

  function showCountryDetail(c) {
    var detail = document.getElementById('countryDetail');
    var scoreCls = c.ai_inflation_score >= 70 ? 'high' :
      c.ai_inflation_score >= 55 ? 'elevated' :
        c.ai_inflation_score >= 40 ? 'moderate' : 'low';
    detail.style.display = 'block';
    detail.innerHTML =
      '<div class="detail__header">' +
      '<div><div class="detail__title">' + esc(c.name) + '</div>' +
      '<div style="color:var(--dim);font-size:14px;margin-top:4px">' + esc(c.region) + '</div></div>' +
      '<div style="text-align:right">' +
      '<div class="detail__score-big" style="color:' + scoreToColor(c.ai_inflation_score) + '">' + c.ai_inflation_score + '</div>' +
      '<div style="font-size:12px;color:var(--dim)">AI Inflation Score</div>' +
      '</div>' +
      '<button class="detail__close" onclick="document.getElementById(\'countryDetail\').style.display=\'none\'">Close</button>' +
      '</div>' +
      '<div class="detail__grid">' +
      stat('Overall CPI', c.overall_cpi + '%') +
      stat('AI Contribution', '+' + c.ai_contribution_ppt + ' ppt') +
      stat('AI Readiness', c.ai_readiness + '/100') +
      stat('Cloud Adoption', c.cloud_adoption_pct + '%') +
      stat('Data Centers', c.data_centers.toLocaleString()) +
      stat('GPU Import Dep.', c.gpu_import_dependence_pct + '%') +
      stat('Renewable Energy', c.renewable_energy_pct + '%') +
      stat('Avg Electricity', '$' + c.avg_electricity_cost_kwh + '/kWh') +
      stat('Avg AI Sub Cost', '$' + c.avg_ai_subscription_cost + '/mo') +
      stat('Gov AI Spending', '$' + c.gov_ai_spending_billions + 'B') +
      stat('AI Jobs Growth', '+' + c.ai_jobs_growth_pct + '%') +
      stat('AI Startups', c.ai_startups.toLocaleString()) +
      '</div>' +
      '<div class="detail__drivers"><strong style="font-size:13px;color:var(--dim);display:block;margin-bottom:8px">Primary AI Inflation Drivers</strong>' +
      c.primary_drivers.map(function (d) { return '<span class="detail__driver-tag">' + esc(d) + '</span>'; }).join('') +
      '</div>' +
      '<div class="detail__insight"><strong>Key Insight:</strong> ' + esc(c.key_insight) + '</div>';
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function stat(label, value) {
    return '<div class="detail__stat"><div class="detail__stat-label">' + label + '</div><div class="detail__stat-value">' + value + '</div></div>';
  }

  // ═══════════════ PRODUCTS ═══════════════
  function renderProducts(layer) {
    var data = products.layers[layer];
    if (!data) return;
    var grid = document.getElementById('productsGrid');
    grid.innerHTML = data.products.map(function (p) {
      var aiCls = p.ai_premium_pct > 0 ? 'positive' : 'negative';
      var normalCls = p.normal_inflation_pct > 0 ? 'positive' : 'negative';
      return '<div class="product__card">' +
        '<div class="product__name">' + esc(p.name) + '</div>' +
        '<div class="product__category">' + esc(p.category) + '</div>' +
        '<div class="product__metrics">' +
        '<div><div class="product__metric-label">AI Premium</div>' +
        '<div class="product__metric-value ' + aiCls + '">' + (p.ai_premium_pct > 0 ? '+' : '') + p.ai_premium_pct + '%</div></div>' +
        '<div><div class="product__metric-label">Normal Inflation</div>' +
        '<div class="product__metric-value ' + normalCls + '">' + (p.normal_inflation_pct > 0 ? '+' : '') + p.normal_inflation_pct + '%</div></div>' +
        '</div>' +
        '<div class="product__price">' + esc(p.example_price) + '</div>' +
        '<div class="product__confidence"><span>Confidence</span>' +
        '<div class="product__conf-bar"><div class="product__conf-fill" style="width:' + p.confidence + '%"></div></div>' +
        '<span>' + p.confidence + '%</span></div>' +
        '<div class="product__source">Source: ' + esc(p.source) + '</div>' +
        '</div>';
    }).join('');
  }

  function renderCausalSelector() {
    var select = document.getElementById('causalSelect');
    products.causal_chains.forEach(function (chain) {
      var opt = document.createElement('option');
      opt.value = chain.trigger;
      opt.textContent = chain.trigger;
      select.appendChild(opt);
    });
    select.addEventListener('change', function () {
      var chain = products.causal_chains.find(function (c) { return c.trigger === select.value; });
      renderCausalChain(chain);
    });
  }

  function renderCausalChain(chain) {
    var el = document.getElementById('causalChain');
    if (!chain) { el.innerHTML = ''; return; }
    el.innerHTML = '<div class="chain__container">' +
      chain.chain.map(function (node, i) {
        var isLast = i === chain.chain.length - 1;
        return '<div class="chain__node">' +
          '<div class="chain__line">' +
          '<div class="chain__dot"></div>' +
          (!isLast ? '<div class="chain__connector"></div>' : '') +
          '</div>' +
          '<div class="chain__content">' +
          '<div class="chain__label">' + esc(node.node) + '</div>' +
          '<div class="chain__evidence">' + esc(node.evidence) + '</div>' +
          '<div class="chain__confidence">Confidence: ' + node.confidence + '%</div>' +
          '</div></div>';
      }).join('') +
      '</div>';
  }

  // ═══════════════ SUBSCRIPTIONS ═══════════════
  function renderSubscriptions(list) {
    var data = list || subscriptions.services;
    var stats = subscriptions.aggregate_stats;

    document.getElementById('subsStats').innerHTML =
      '<div class="subs__stat"><div class="subs__stat-label">Avg Consumer Monthly</div><div class="subs__stat-value">$' + stats.avg_consumer_monthly.toFixed(0) + '</div></div>' +
      '<div class="subs__stat"><div class="subs__stat-label">Avg Enterprise / User</div><div class="subs__stat-value">$' + stats.avg_enterprise_monthly_per_user.toFixed(0) + '</div></div>' +
      '<div class="subs__stat"><div class="subs__stat-label">YoY Price Change (Avg)</div><div class="subs__stat-value">' + stats.yoy_price_change_avg_pct + '%</div></div>' +
      '<div class="subs__stat"><div class="subs__stat-label">Services with Increases</div><div class="subs__stat-value">' + stats.services_with_price_increase_pct + '%</div></div>';

    var grid = document.getElementById('subsGrid');
    grid.innerHTML = data.map(function (s) {
      var changeCls = s.change_pct > 0 ? 'up' : s.change_pct < 0 ? 'down' : 'flat';
      var changeText = s.change_pct > 0 ? '+' + s.change_pct + '%' : s.change_pct === 0 ? 'No change' : s.change_pct + '%';
      var maxPrice = Math.max.apply(null, s.price_history.map(function (h) { return h.price; }));
      var bars = s.price_history.map(function (h) {
        var pct = maxPrice > 0 ? (h.price / maxPrice * 100) : 0;
        return '<div class="sub__bar" style="height:' + Math.max(pct, 10) + '%" title="' + h.date + ': $' + h.price + '"></div>';
      }).join('');
      return '<div class="sub__card">' +
        '<div class="sub__header"><div class="sub__name">' + esc(s.name) + '</div>' +
        '<span class="sub__change ' + changeCls + '">' + changeText + '</span></div>' +
        '<div class="sub__provider">' + esc(s.provider) + '</div>' +
        '<div class="sub__price">$' + s.current_price + '<span class="sub__price-unit"> /' + esc(s.billing) + '</span></div>' +
        '<div class="sub__timeline">' + bars + '</div>' +
        '<span class="sub__category">' + esc(s.category) + '</span>' +
        '<span class="sub__tier">' + esc(s.tier) + '</span>' +
        '</div>';
    }).join('');
  }

  // ═══════════════ CALCULATOR ═══════════════
  function renderCalculatorCountries() {
    var select = document.getElementById('calcCountry');
    countries.countries.sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c.code;
      opt.textContent = c.name;
      select.appendChild(opt);
    });
  }

  function setupCalculator() {
    document.getElementById('calcForm').addEventListener('submit', function (e) {
      e.preventDefault();
      calculateExposure();
    });
  }

  function calculateExposure() {
    var code = document.getElementById('calcCountry').value;
    var income = parseFloat(document.getElementById('calcIncome').value) || 50000;
    var family = parseInt(document.getElementById('calcFamily').value) || 1;
    var profession = document.getElementById('calcProfession').value;
    var electricity = parseFloat(document.getElementById('calcElectricity').value) || 100;
    var cloud = document.getElementById('calcCloud').value;
    var homeowner = document.getElementById('calcHomeowner').value;

    var devices = [];
    document.querySelectorAll('.calc__checks input[value="laptop"]').forEach(function (cb) {
      if (cb.closest('.calc__group').querySelector('.calc__label').textContent === 'Devices Owned') {
        document.querySelectorAll('.calc__group:nth-of-type(5) input:checked').forEach(function (c) { devices.push(c.value); });
      }
    });
    var checkedDevices = [];
    var checkedSubs = [];
    var groups = document.querySelectorAll('.calc__group');
    groups.forEach(function (g) {
      var label = g.querySelector('.calc__label');
      if (!label) return;
      if (label.textContent === 'Devices Owned') {
        g.querySelectorAll('input:checked').forEach(function (c) { checkedDevices.push(c.value); });
      }
      if (label.textContent === 'AI Subscriptions') {
        g.querySelectorAll('input:checked').forEach(function (c) { checkedSubs.push(c.value); });
      }
    });

    var country = countries.countries.find(function (c) { return c.code === code; });
    var countryMultiplier = country ? country.ai_inflation_score / 50 : 1;

    var profMultiplier = { tech: 1.8, finance: 1.5, healthcare: 1.2, freelance: 1.6, education: 1.1, manufacturing: 1.0, retail: 0.9, government: 0.8, student: 0.7, other: 1.0 };
    var pMult = profMultiplier[profession] || 1;

    var breakdown = [];

    // Device costs
    var deviceCosts = { laptop: 62, phone: 18, tablet: 22, gaming: 85, smart_home: 14 };
    checkedDevices.forEach(function (d) {
      var cost = (deviceCosts[d] || 20) * countryMultiplier * (family > 2 ? 1.3 : 1);
      breakdown.push({ name: d.replace('_', ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); }), value: Math.round(cost) });
    });

    // Electricity
    var elecCost = electricity * 12 * 0.03 * countryMultiplier;
    breakdown.push({ name: 'Electricity (AI demand)', value: Math.round(elecCost) });

    // AI subscriptions
    var subCosts = { chatgpt: 240, claude: 240, copilot: 120, midjourney: 360, notion_ai: 120, other_ai: 180 };
    checkedSubs.forEach(function (s) {
      var cost = (subCosts[s] || 120) * 0.042;
      breakdown.push({ name: s.replace('_', ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); }) + ' (price risk)', value: Math.round(cost) });
    });

    // Cloud costs
    var cloudCosts = { none: 0, personal: 24, professional: 180, heavy: 420 };
    var cc = (cloudCosts[cloud] || 0) * countryMultiplier * 0.05;
    if (cc > 0) breakdown.push({ name: 'Cloud Services', value: Math.round(cc) });

    // SaaS/Software inflation
    var softwareCost = income * 0.003 * pMult * countryMultiplier;
    breakdown.push({ name: 'Software & SaaS', value: Math.round(softwareCost) });

    // Insurance & healthcare AI
    var insuranceCost = income * 0.001 * countryMultiplier;
    breakdown.push({ name: 'Insurance & Healthcare', value: Math.round(insuranceCost) });

    // Housing (if homeowner near tech hub)
    if (homeowner === 'yes') {
      var housingCost = income * 0.002 * countryMultiplier;
      breakdown.push({ name: 'Housing (AI corridor premium)', value: Math.round(housingCost) });
    }

    // Internet
    breakdown.push({ name: 'Internet & Connectivity', value: Math.round(18 * countryMultiplier) });

    breakdown.sort(function (a, b) { return b.value - a.value; });

    var total = breakdown.reduce(function (sum, b) { return sum + b.value; }, 0);
    var monthly = Math.round(total / 12);
    var riskPct = total / income * 100;
    var riskLevel = riskPct > 1.5 ? 'high' : riskPct > 0.7 ? 'moderate' : 'low';

    var resultsEl = document.getElementById('calcResults');
    resultsEl.style.display = 'block';
    document.getElementById('calcTotal').textContent = '$' + total.toLocaleString();
    document.getElementById('calcMonthly').textContent = '$' + monthly + ' / month';

    var riskEl = document.getElementById('calcRisk');
    riskEl.className = 'calc__result-risk ' + riskLevel;
    riskEl.textContent = 'Risk Level: ' + riskLevel.toUpperCase() + ' — ' + riskPct.toFixed(1) + '% of annual income';

    document.getElementById('calcBreakdown').innerHTML = breakdown.map(function (b) {
      return '<div class="calc__breakdown-item">' +
        '<span class="calc__breakdown-name">' + esc(b.name) + '</span>' +
        '<span class="calc__breakdown-value">+$' + b.value + '</span></div>';
    }).join('');

    var recs = [];
    if (checkedSubs.length > 2) recs.push('Consider consolidating AI subscriptions — many overlap in capabilities.');
    if (electricity > 150) recs.push('Your electricity exposure is significant. Consider energy efficiency measures or renewable energy sources.');
    if (profession === 'tech') recs.push('Tech professionals face above-average AI inflation exposure through software licensing and tool costs.');
    if (homeowner === 'yes' && country && country.data_centers > 200) recs.push('Properties near data center corridors may see higher appreciation but also higher energy costs.');
    if (cloud === 'heavy') recs.push('Heavy cloud usage has direct AI inflation exposure. Consider reserved instances or committed use discounts.');
    recs.push('Monitor AI subscription pricing — competition between providers is keeping some prices stable for now.');

    document.getElementById('calcRecommendations').innerHTML =
      '<div class="calc__rec-title">Recommendations</div>' +
      recs.map(function (r) {
        return '<div class="calc__rec-item"><span class="calc__rec-icon">→</span><span>' + esc(r) + '</span></div>';
      }).join('');

    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ═══════════════ ENERGY ═══════════════
  function renderEnergy() {
    var energyData = [
      { year: '2020', total: 300, ai: 30, label: '300 TWh' },
      { year: '2021', total: 330, ai: 45, label: '330 TWh' },
      { year: '2022', total: 370, ai: 70, label: '370 TWh' },
      { year: '2023', total: 420, ai: 110, label: '420 TWh' },
      { year: '2024', total: 460, ai: 160, label: '460 TWh' },
      { year: '2025', total: 520, ai: 220, label: '520 TWh' },
      { year: '2026E', total: 580, ai: 300, label: '580 TWh' },
      { year: '2028E', total: 750, ai: 450, label: '750 TWh' },
      { year: '2030E', total: 1000, ai: 650, label: '~1,000 TWh' }
    ];

    document.getElementById('energyStats').innerHTML =
      '<div class="energy__stat"><div class="energy__stat-label">Global DC Electricity (2026E)</div><div class="energy__stat-value">580 TWh</div><div class="energy__stat-sub">+26% vs 2024 · Source: IEA</div></div>' +
      '<div class="energy__stat"><div class="energy__stat-label">AI Share of DC Power</div><div class="energy__stat-value">52%</div><div class="energy__stat-sub">Up from 10% in 2020 · Source: IEA, Goldman Sachs</div></div>' +
      '<div class="energy__stat"><div class="energy__stat-label">US DC Share of Grid</div><div class="energy__stat-value">~6%</div><div class="energy__stat-sub">Projected 12% by 2030 · Source: EIA</div></div>' +
      '<div class="energy__stat"><div class="energy__stat-label">ChatGPT Query vs Google</div><div class="energy__stat-value">~10x</div><div class="energy__stat-sub">Energy per query · Source: IEA</div></div>' +
      '<div class="energy__stat"><div class="energy__stat-label">Frontier Model Training</div><div class="energy__stat-value">~50 GWh</div><div class="energy__stat-sub">Equivalent to ~5,000 US homes/yr · Source: Epoch AI</div></div>';

    var maxTotal = Math.max.apply(null, energyData.map(function (d) { return d.total; }));
    document.getElementById('energyChart').innerHTML =
      '<div class="chart__title">Global Data Center Electricity Consumption (TWh) — AI vs Non-AI</div>' +
      '<div class="chart__bars">' +
      energyData.map(function (d) {
        var totalPct = d.total / maxTotal * 100;
        var aiPct = d.ai / maxTotal * 100;
        var nonAiPct = (d.total - d.ai) / maxTotal * 100;
        return '<div class="chart__bar-group">' +
          '<div class="chart__bar ai" style="height:' + aiPct + '%" title="AI: ' + d.ai + ' TWh"><div class="chart__bar-value">' + d.ai + '</div></div>' +
          '<div class="chart__bar total" style="height:' + nonAiPct + '%" title="Non-AI: ' + (d.total - d.ai) + ' TWh"></div>' +
          '<div class="chart__bar-label">' + d.year + '</div>' +
          '</div>';
      }).join('') +
      '</div>' +
      '<div style="display:flex;gap:16px;margin-top:12px;font-size:12px;color:var(--dim)">' +
      '<span><span style="display:inline-block;width:12px;height:12px;background:var(--accent);border-radius:2px;vertical-align:middle;margin-right:4px"></span>AI workloads</span>' +
      '<span><span style="display:inline-block;width:12px;height:12px;background:var(--rule);border-radius:2px;vertical-align:middle;margin-right:4px"></span>Traditional workloads</span>' +
      '<span style="margin-left:auto;font-style:italic">E = Estimated · Source: IEA, Goldman Sachs Research</span>' +
      '</div>';
  }

  // ═══════════════ NAVIGATION ═══════════════
  function setupNav() {
    var hamburger = document.getElementById('hamburgerBtn');
    var nav = document.getElementById('mainNav');
    hamburger.addEventListener('click', function () {
      nav.classList.toggle('open');
    });

    document.querySelectorAll('.topbar__link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
      });
    });

    var sections = document.querySelectorAll('.section, .hero');
    var links = document.querySelectorAll('.topbar__link');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          links.forEach(function (l) {
            l.classList.toggle('is-active', l.getAttribute('data-section') === id);
          });
        }
      });
    }, { rootMargin: '-30% 0px -70% 0px' });
    sections.forEach(function (s) { observer.observe(s); });
  }

  // ═══════════════ FILTERS ═══════════════
  function setupFilters() {
    // Country filters
    ['regionFilter', 'riskFilter', 'sortFilter'].forEach(function (id) {
      document.getElementById(id).addEventListener('change', filterCountries);
    });

    // Product tabs
    document.querySelectorAll('.products__tabs .tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.products__tabs .tab').forEach(function (t) { t.classList.remove('is-active'); });
        this.classList.add('is-active');
        renderProducts(this.getAttribute('data-layer'));
      });
    });

    // Subscription filters
    ['subsCategoryFilter', 'subsTierFilter'].forEach(function (id) {
      document.getElementById(id).addEventListener('change', filterSubscriptions);
    });
  }

  function filterCountries() {
    var region = document.getElementById('regionFilter').value;
    var risk = document.getElementById('riskFilter').value;
    var sort = document.getElementById('sortFilter').value;
    var filtered = countries.countries.filter(function (c) {
      if (region && c.region !== region) return false;
      if (risk && c.risk_level !== risk) return false;
      return true;
    });
    if (sort === 'score-desc') filtered.sort(function (a, b) { return b.ai_inflation_score - a.ai_inflation_score; });
    else if (sort === 'score-asc') filtered.sort(function (a, b) { return a.ai_inflation_score - b.ai_inflation_score; });
    else if (sort === 'name-asc') filtered.sort(function (a, b) { return a.name.localeCompare(b.name); });
    else if (sort === 'trend') {
      var trendOrder = { rising: 0, moderate: 1, stable: 2 };
      filtered.sort(function (a, b) { return (trendOrder[a.trend] || 2) - (trendOrder[b.trend] || 2); });
    }
    renderCountries(filtered);
  }

  function filterSubscriptions() {
    var cat = document.getElementById('subsCategoryFilter').value;
    var tier = document.getElementById('subsTierFilter').value;
    var filtered = subscriptions.services.filter(function (s) {
      if (cat && s.category !== cat) return false;
      if (tier && s.tier !== tier) return false;
      return true;
    });
    var grid = document.getElementById('subsGrid');
    grid.innerHTML = '';
    renderSubGrid(filtered);
  }

  function renderSubGrid(data) {
    var grid = document.getElementById('subsGrid');
    grid.innerHTML = data.map(function (s) {
      var changeCls = s.change_pct > 0 ? 'up' : s.change_pct < 0 ? 'down' : 'flat';
      var changeText = s.change_pct > 0 ? '+' + s.change_pct + '%' : s.change_pct === 0 ? 'No change' : s.change_pct + '%';
      var maxPrice = Math.max.apply(null, s.price_history.map(function (h) { return h.price; }));
      var bars = s.price_history.map(function (h) {
        var pct = maxPrice > 0 ? (h.price / maxPrice * 100) : 0;
        return '<div class="sub__bar" style="height:' + Math.max(pct, 10) + '%" title="' + h.date + ': $' + h.price + '"></div>';
      }).join('');
      return '<div class="sub__card">' +
        '<div class="sub__header"><div class="sub__name">' + esc(s.name) + '</div>' +
        '<span class="sub__change ' + changeCls + '">' + changeText + '</span></div>' +
        '<div class="sub__provider">' + esc(s.provider) + '</div>' +
        '<div class="sub__price">$' + s.current_price + '<span class="sub__price-unit"> /' + esc(s.billing) + '</span></div>' +
        '<div class="sub__timeline">' + bars + '</div>' +
        '<span class="sub__category">' + esc(s.category) + '</span>' +
        '<span class="sub__tier">' + esc(s.tier) + '</span>' +
        '</div>';
    }).join('');
  }

  // ═══════════════ UTILITIES ═══════════════
  function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }


  // ═══════════════ TICKER ═══════════════
  function initTicker() {
    var track = document.getElementById('tickerTrack');
    if (!track) return;
    var clone = track.innerHTML;
    track.innerHTML = clone + clone;
  }

  // Boot
  document.addEventListener('DOMContentLoaded', init);
})();
